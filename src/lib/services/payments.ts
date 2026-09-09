import {
  Prisma,
  ServiceRequestStatus,
  PaymentStatus,
  DisputeStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  APPROVAL_WINDOW_DAYS,
  PLATFORM_COMMISSION_RATE,
} from "@/lib/constants";
import { notify } from "@/lib/services/notifications";
import type { DeliverWorkInput } from "@/lib/validations/service";

export class PaymentError extends Error {}

/** Komisyon ve hizmet verene kalan tutarı hesaplar. */
export function computeFees(amount: number) {
  const platformFee = Math.round(amount * PLATFORM_COMMISSION_RATE);
  const providerPayout = amount - platformFee;
  return { platformFee, providerPayout };
}

/**
 * EMANET (ESCROW) ÖDEME — MOCK
 * ────────────────────────────
 * Gerçek entegrasyonda burada iyzico/PayTR pazaryeri (alt üye işyeri) çağrısı
 * yapılır ve tutar emanete alınır. Şimdilik simülasyon: ödeme HELD'e çekilir.
 *
 * Akış: OFFER_SELECTED → (ödeme) → IN_ESCROW
 *  - Payment.status = HELD, heldAt set, platformFee hesaplanır
 *  - ServiceRequest.status = IN_ESCROW
 *  - Konuşma açılır + iletişim kilidi kaldırılır (contactUnlocked = true)
 */
export async function fundEscrow(customerId: string, requestId: string) {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: { payment: true },
  });

  if (!request) throw new PaymentError("Talep bulunamadı.");
  if (request.customerId !== customerId)
    throw new PaymentError("Bu talep sana ait değil.");
  if (request.status !== ServiceRequestStatus.OFFER_SELECTED)
    throw new PaymentError("Ödeme yalnızca teklif seçildikten sonra yapılabilir.");
  if (!request.payment)
    throw new PaymentError("Ödeme kaydı bulunamadı.");
  if (request.payment.status !== PaymentStatus.PENDING)
    throw new PaymentError("Bu ödeme zaten işlenmiş.");

  const { platformFee } = computeFees(request.payment.amount);
  const providerId = request.payment.providerId;

  const payment = await prisma.$transaction(async (tx) => {
    const updated = await tx.payment.update({
      where: { id: request.payment!.id },
      data: {
        status: PaymentStatus.HELD,
        platformFee,
        heldAt: new Date(),
        // Gerçek entegrasyonda ödeme kuruluşunun işlem referansı buraya yazılır.
        externalRef: `MOCK-${Date.now()}`,
      },
    });

    await tx.serviceRequest.update({
      where: { id: requestId },
      data: { status: ServiceRequestStatus.IN_ESCROW },
    });

    // Konuşmayı aç + iletişim bilgilerini görünür yap
    await tx.conversation.upsert({
      where: { serviceRequestId: requestId },
      update: { contactUnlocked: true },
      create: {
        serviceRequestId: requestId,
        contactUnlocked: true,
        participants: {
          create: [{ userId: customerId }, { userId: providerId }],
        },
      },
    });

    // Sistem mesajı
    await addSystemMessageTx(tx, requestId, "Ödeme emanete alındı. İletişim bilgileri artık görünür.");

    return updated;
  });

  // Hizmet verene bildirim: işe başlayabilir
  await notify(providerId, {
    type: "ESCROW_FUNDED",
    title: "Ödeme emanete alındı",
    body: `"${request.title}" için ödeme güvenceye alındı. İşe başlayabilirsin.`,
    link: `/panel/hizmet-ver/${requestId}`,
  });

  return payment;
}

/**
 * Hizmet veren "İşi tamamladım" der.
 * Akış: IN_ESCROW → DELIVERED
 *  - WorkDelivery oluşturulur (note + files)
 *  - Payment.approvalDeadline = now + APPROVAL_WINDOW_DAYS
 *  - ServiceRequest.status = DELIVERED
 */
export async function deliverWork(
  providerId: string,
  requestId: string,
  input: DeliverWorkInput,
) {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: { payment: { include: { delivery: true } } },
  });

  if (!request) throw new PaymentError("Talep bulunamadı.");
  if (!request.payment) throw new PaymentError("Ödeme kaydı bulunamadı.");
  if (request.payment.providerId !== providerId)
    throw new PaymentError("Bu iş sana atanmamış.");
  if (request.status !== ServiceRequestStatus.IN_ESCROW)
    throw new PaymentError("İş yalnızca emanet aşamasında teslim edilebilir.");

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + APPROVAL_WINDOW_DAYS);

  const result = await prisma.$transaction(async (tx) => {
    await tx.workDelivery.upsert({
      where: { paymentId: request.payment!.id },
      update: {
        note: input.note,
        files: input.files,
        deliveredAt: new Date(),
        approvedAt: null,
      },
      create: {
        paymentId: request.payment!.id,
        note: input.note,
        files: input.files,
      },
    });

    await tx.payment.update({
      where: { id: request.payment!.id },
      data: { approvalDeadline: deadline },
    });

    await tx.serviceRequest.update({
      where: { id: requestId },
      data: { status: ServiceRequestStatus.DELIVERED },
    });

    await addSystemMessageTx(
      tx,
      requestId,
      "Hizmet veren işi tamamladığını bildirdi. Lütfen kontrol edip onayla.",
    );

    return { ok: true };
  });

  // Müşteriye bildirim: onayına sunuldu
  await notify(request.customerId, {
    type: "WORK_DELIVERED",
    title: "İş teslim edildi",
    body: `"${request.title}" işi tamamlandı olarak işaretlendi. Kontrol edip onaylayabilirsin.`,
    link: `/panel/hizmet-al/${requestId}`,
  });

  return result;
}

/**
 * Müşteri işi onaylar → ödeme hizmet verene aktarılır.
 * Akış: DELIVERED → COMPLETED
 *  - Payment.status = RELEASED, releasedAt set
 *  - WorkDelivery.approvedAt set
 *  - ServiceRequest.status = COMPLETED
 *  - Hizmet verenin completedJobs +1
 */
export async function approveWork(customerId: string, requestId: string) {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: { payment: { include: { delivery: true } } },
  });

  if (!request) throw new PaymentError("Talep bulunamadı.");
  if (request.customerId !== customerId)
    throw new PaymentError("Bu talep sana ait değil.");
  if (!request.payment) throw new PaymentError("Ödeme kaydı bulunamadı.");
  if (request.status !== ServiceRequestStatus.DELIVERED)
    throw new PaymentError("Onay yalnızca iş teslim edildikten sonra yapılabilir.");

  const providerId = request.payment.providerId;

  const result = await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: request.payment!.id },
      data: { status: PaymentStatus.RELEASED, releasedAt: new Date() },
    });

    if (request.payment!.delivery) {
      await tx.workDelivery.update({
        where: { paymentId: request.payment!.id },
        data: { approvedAt: new Date() },
      });
    }

    await tx.serviceRequest.update({
      where: { id: requestId },
      data: { status: ServiceRequestStatus.COMPLETED },
    });

    // Hizmet verenin tamamlanan iş sayacı
    await tx.providerProfile.updateMany({
      where: { userId: providerId },
      data: { completedJobs: { increment: 1 } },
    });

    await addSystemMessageTx(
      tx,
      requestId,
      "Müşteri işi onayladı. Ödeme hizmet verene aktarıldı. Teşekkürler!",
    );

    return { ok: true };
  });

  // Hizmet verene bildirim: ödeme aktarıldı
  await notify(providerId, {
    type: "WORK_APPROVED",
    title: "İşin onaylandı 🎉",
    body: `"${request.title}" işini müşteri onayladı. Ödeme hesabına aktarıldı.`,
    link: `/panel/hizmet-ver/${requestId}`,
  });

  return result;
}

/**
 * İtiraz aç (müşteri veya hizmet veren).
 * Akış: IN_ESCROW | DELIVERED → DISPUTED
 *  - Dispute kaydı oluşturulur
 *  - Payment.status = DISPUTED (ödeme durdurulur)
 *  - ServiceRequest.status = DISPUTED
 */
export async function openDispute(
  userId: string,
  requestId: string,
  reason: string,
) {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: { payment: true, dispute: true },
  });

  if (!request) throw new PaymentError("Talep bulunamadı.");
  if (!request.payment) throw new PaymentError("Bu talep için ödeme yok.");

  const isCustomer = request.customerId === userId;
  const isProvider = request.payment.providerId === userId;
  if (!isCustomer && !isProvider)
    throw new PaymentError("Bu talep için itiraz açamazsın.");

  if (
    request.status !== ServiceRequestStatus.IN_ESCROW &&
    request.status !== ServiceRequestStatus.DELIVERED
  )
    throw new PaymentError("Bu aşamada itiraz açılamaz.");
  if (request.dispute)
    throw new PaymentError("Bu talep için zaten bir itiraz açık.");

  const result = await prisma.$transaction(async (tx) => {
    await tx.dispute.create({
      data: {
        serviceRequestId: requestId,
        openedById: userId,
        reason,
        status: DisputeStatus.OPEN,
      },
    });

    await tx.payment.update({
      where: { id: request.payment!.id },
      data: { status: PaymentStatus.DISPUTED },
    });

    await tx.serviceRequest.update({
      where: { id: requestId },
      data: { status: ServiceRequestStatus.DISPUTED },
    });

    await addSystemMessageTx(
      tx,
      requestId,
      "Bir itiraz açıldı. Ödeme, çözüme kadar durduruldu. Ekibimiz inceleyecek.",
    );

    return { ok: true };
  });

  // Karşı tarafa bildirim
  const otherId = isCustomer ? request.payment.providerId : request.customerId;
  await notify(otherId, {
    type: "DISPUTE_OPENED",
    title: "Bir itiraz açıldı",
    body: `"${request.title}" için itiraz açıldı. Ödeme, çözüme kadar durduruldu.`,
    link: isCustomer
      ? `/panel/hizmet-ver/${requestId}`
      : `/panel/hizmet-al/${requestId}`,
  });

  return result;
}

/** Konuşma varsa sistem mesajı ekler (tx içinde). Konuşma yoksa sessizce geçer. */
async function addSystemMessageTx(
  tx: Prisma.TransactionClient,
  requestId: string,
  body: string,
) {
  const convo = await tx.conversation.findUnique({
    where: { serviceRequestId: requestId },
    select: { id: true, participants: { select: { userId: true }, take: 1 } },
  });
  if (!convo || convo.participants.length === 0) return;
  await tx.message.create({
    data: {
      conversationId: convo.id,
      senderId: convo.participants[0].userId,
      body,
      isSystem: true,
    },
  });
}
