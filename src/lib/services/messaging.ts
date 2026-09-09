import { PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/services/notifications";
import type { MessageInput } from "@/lib/validations/service";

export class MessagingError extends Error {}

/**
 * Telefon/e-posta gibi iletişim bilgilerini maskeler.
 * Ödeme emanete alınana (contactUnlocked) kadar mesaj içindeki iletişim
 * bilgileri gizlenir — platform dışı anlaşmayı önlemek için.
 */
export function maskContact(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]{2,}/g, "•••@•••")
    .replace(/(\+?\d[\d\s().-]{8,}\d)/g, "•••••••");
}

/**
 * Talebe ait konuşmayı getirir; yoksa oluşturur.
 * Konuşma yalnızca kazanan teklif belli olduğunda (OFFER_SELECTED sonrası) açılır.
 * Katılımcılar: müşteri + kazanan hizmet veren.
 */
export async function getOrCreateConversationForRequest(
  requestId: string,
  userId: string,
) {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: {
      offers: { where: { status: "WON" }, select: { providerId: true } },
      payment: { select: { providerId: true, status: true } },
      conversation: { select: { id: true, contactUnlocked: true } },
    },
  });

  if (!request) throw new MessagingError("Talep bulunamadı.");

  const providerId =
    request.payment?.providerId ?? request.offers[0]?.providerId ?? null;
  if (!providerId)
    throw new MessagingError("Mesajlaşma, teklif seçildikten sonra açılır.");

  const customerId = request.customerId;
  if (userId !== customerId && userId !== providerId)
    throw new MessagingError("Bu görüşmeye erişimin yok.");

  if (request.conversation) return request.conversation;

  const unlocked =
    request.payment?.status === PaymentStatus.HELD ||
    request.payment?.status === PaymentStatus.RELEASED;

  const convo = await prisma.conversation.create({
    data: {
      serviceRequestId: requestId,
      contactUnlocked: unlocked,
      participants: {
        create: [{ userId: customerId }, { userId: providerId }],
      },
    },
    select: { id: true, contactUnlocked: true },
  });
  return convo;
}

/** Kullanıcının bu konuşmanın katılımcısı olduğunu doğrular. */
async function assertParticipant(conversationId: string, userId: string) {
  const p = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!p) throw new MessagingError("Bu görüşmeye erişimin yok.");
  return p;
}

/** Konuşmadaki mesajları döndürür (iletişim kilitliyse maskelenmiş). */
export async function listMessages(userId: string, conversationId: string) {
  await assertParticipant(conversationId, userId);

  const convo = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { contactUnlocked: true },
  });
  const unlocked = convo?.contactUnlocked ?? false;

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, fullName: true } } },
  });

  return {
    contactUnlocked: unlocked,
    messages: messages.map((m) => ({
      id: m.id,
      body:
        m.body && !unlocked && !m.isSystem ? maskContact(m.body) : m.body,
      attachments: m.attachments,
      isSystem: m.isSystem,
      senderId: m.senderId,
      senderName: m.sender.fullName,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}

/** Konuşmaya mesaj gönderir. */
export async function sendMessage(
  userId: string,
  conversationId: string,
  input: MessageInput,
) {
  await assertParticipant(conversationId, userId);

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: userId,
      body: input.body?.trim() || null,
      attachments: input.attachments ?? [],
    },
  });

  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId } },
    data: { lastReadAt: new Date() },
  });

  // Diğer katılımcı(lar)a bildirim
  const convo = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      serviceRequestId: true,
      serviceRequest: { select: { customerId: true, title: true } },
      participants: { select: { userId: true } },
    },
  });
  if (convo) {
    const senderName =
      (await prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true },
      }))?.fullName ?? "Bir kullanıcı";
    for (const p of convo.participants) {
      if (p.userId === userId) continue;
      const isCustomer = p.userId === convo.serviceRequest?.customerId;
      await notify(p.userId, {
        type: "MESSAGE_RECEIVED",
        title: `Yeni mesaj: ${senderName}`,
        body: `"${convo.serviceRequest?.title ?? "talep"}" hakkında yeni bir mesajın var.`,
        link: isCustomer
          ? `/panel/hizmet-al/${convo.serviceRequestId}`
          : `/panel/hizmet-ver/${convo.serviceRequestId}`,
      });
    }
  }

  return message;
}
