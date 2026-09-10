import {
  Prisma,
  ServiceRequestStatus,
  ProblemType,
  ProblemStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { APPROVAL_WINDOW_DAYS } from "@/lib/constants";
import { notify } from "@/lib/services/notifications";
import { recomputeTrust } from "@/lib/services/trust";
import type {
  DeliverWorkInput,
  ProblemReportInput,
} from "@/lib/validations/service";

/**
 * 1. YIL EMANETSİZ İŞ AKIŞI
 * ──────────────────────────
 * Ödeme/komisyon/emanet YOK. Hizmet bedeli taraflar arasında doğrudan ödenir.
 * Platform yalnızca süreci ve kararlaştırılan tutarı (raporlama için) kaydeder.
 *
 * Durumlar:
 *  OFFER_SELECTED → SCHEDULED → IN_PROGRESS → DELIVERED → COMPLETED
 *  (herhangi bir aşamada) → PROBLEM_REPORTED | CANCELLED
 */
export class WorkflowError extends Error {}

/** Talebi kazanan hizmet vereni bulur (payment.providerId). */
async function loadJob(requestId: string) {
  return prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: { payment: { include: { delivery: true } } },
  });
}

/** Konuşma varsa sistem mesajı ekler. */
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

/**
 * Müşteri randevu oluşturur (teklif seçildikten sonra).
 * OFFER_SELECTED → SCHEDULED. İletişim açılır (ödeme yok).
 */
export async function scheduleJob(
  customerId: string,
  requestId: string,
  scheduledAt: string,
) {
  const request = await loadJob(requestId);
  if (!request) throw new WorkflowError("Talep bulunamadı.");
  if (request.customerId !== customerId)
    throw new WorkflowError("Bu talep sana ait değil.");
  if (request.status !== ServiceRequestStatus.OFFER_SELECTED)
    throw new WorkflowError("Randevu yalnızca teklif seçildikten sonra oluşturulur.");
  if (!request.payment) throw new WorkflowError("Seçilmiş bir teklif bulunamadı.");

  const providerId = request.payment.providerId;
  const when = new Date(scheduledAt);

  await prisma.$transaction(async (tx) => {
    await tx.serviceRequest.update({
      where: { id: requestId },
      data: {
        status: ServiceRequestStatus.SCHEDULED,
        scheduledAt: when,
        agreedPrice: request.payment!.amount,
      },
    });

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

    await addSystemMessageTx(
      tx,
      requestId,
      `Randevu oluşturuldu: ${when.toLocaleString("tr-TR")}. İletişim bilgileri açıldı.`,
    );
  });

  await notify(providerId, {
    type: "APPOINTMENT_CREATED",
    title: "Randevu oluşturuldu",
    body: `"${request.title}" için müşteri randevu belirledi: ${when.toLocaleString("tr-TR")}.`,
    link: `/panel/hizmet-ver/${requestId}`,
  });

  return { ok: true };
}

/** Hizmet veren işe başlar. SCHEDULED → IN_PROGRESS. */
export async function startJob(providerId: string, requestId: string) {
  const request = await loadJob(requestId);
  if (!request) throw new WorkflowError("Talep bulunamadı.");
  if (!request.payment || request.payment.providerId !== providerId)
    throw new WorkflowError("Bu iş sana atanmamış.");
  if (request.status !== ServiceRequestStatus.SCHEDULED)
    throw new WorkflowError("İşe yalnızca randevudan sonra başlanabilir.");

  await prisma.$transaction(async (tx) => {
    await tx.serviceRequest.update({
      where: { id: requestId },
      data: { status: ServiceRequestStatus.IN_PROGRESS, startedAt: new Date() },
    });
    await addSystemMessageTx(tx, requestId, "Hizmet veren işe başladı.");
  });

  await notify(request.customerId, {
    type: "JOB_STARTED",
    title: "İş başladı",
    body: `"${request.title}" işine başlandı.`,
    link: `/panel/hizmet-al/${requestId}`,
  });

  return { ok: true };
}

/** Hizmet veren işi tamamladığını bildirir. IN_PROGRESS → DELIVERED. */
export async function completeByProvider(
  providerId: string,
  requestId: string,
  input: DeliverWorkInput,
) {
  const request = await loadJob(requestId);
  if (!request) throw new WorkflowError("Talep bulunamadı.");
  if (!request.payment || request.payment.providerId !== providerId)
    throw new WorkflowError("Bu iş sana atanmamış.");
  if (request.status !== ServiceRequestStatus.IN_PROGRESS)
    throw new WorkflowError("İş yalnızca başladıktan sonra tamamlanmış olarak işaretlenebilir.");

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + APPROVAL_WINDOW_DAYS);

  await prisma.$transaction(async (tx) => {
    await tx.workDelivery.upsert({
      where: { paymentId: request.payment!.id },
      update: { note: input.note, files: input.files, deliveredAt: new Date(), approvedAt: null },
      create: { paymentId: request.payment!.id, note: input.note, files: input.files },
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
  });

  await notify(request.customerId, {
    type: "WORK_DELIVERED",
    title: "İş tamamlandı olarak işaretlendi",
    body: `"${request.title}" işi tamamlandı. Kontrol edip onaylayabilirsin.`,
    link: `/panel/hizmet-al/${requestId}`,
  });

  return { ok: true };
}

/** Müşteri işi onaylar. DELIVERED → COMPLETED (ödeme yok, sadece kayıt). */
export async function approveByCustomer(customerId: string, requestId: string) {
  const request = await loadJob(requestId);
  if (!request) throw new WorkflowError("Talep bulunamadı.");
  if (request.customerId !== customerId)
    throw new WorkflowError("Bu talep sana ait değil.");
  if (request.status !== ServiceRequestStatus.DELIVERED)
    throw new WorkflowError("Onay yalnızca iş tamamlandıktan sonra yapılabilir.");

  const providerId = request.payment!.providerId;

  await prisma.$transaction(async (tx) => {
    await tx.serviceRequest.update({
      where: { id: requestId },
      data: { status: ServiceRequestStatus.COMPLETED, completedAt: new Date() },
    });
    if (request.payment?.delivery) {
      await tx.workDelivery.update({
        where: { paymentId: request.payment.id },
        data: { approvedAt: new Date() },
      });
    }
    await tx.providerProfile.updateMany({
      where: { userId: providerId },
      data: { completedJobs: { increment: 1 } },
    });
    await addSystemMessageTx(
      tx,
      requestId,
      "Müşteri işi onayladı. İş tamamlandı. Teşekkürler!",
    );
  });

  await notify(providerId, {
    type: "WORK_APPROVED",
    title: "İşin onaylandı 🎉",
    body: `"${request.title}" işini müşteri onayladı.`,
    link: `/panel/hizmet-ver/${requestId}`,
  });

  // Güven puanı + seviyeyi güncelle (akışı bozmaz)
  await recomputeTrust(providerId);

  return { ok: true };
}

/**
 * Sorun bildir (müşteri veya hizmet veren).
 * Aktif bir işte çalışır. Ödeme iadesi kararı YOK; kayıt + admin aksiyonu.
 */
export async function reportProblem(
  userId: string,
  requestId: string,
  input: ProblemReportInput,
) {
  const request = await loadJob(requestId);
  if (!request) throw new WorkflowError("Talep bulunamadı.");
  const isCustomer = request.customerId === userId;
  const isProvider = request.payment?.providerId === userId;
  if (!isCustomer && !isProvider)
    throw new WorkflowError("Bu iş için sorun bildiremezsin.");

  const reportable: ServiceRequestStatus[] = [
    ServiceRequestStatus.SCHEDULED,
    ServiceRequestStatus.IN_PROGRESS,
    ServiceRequestStatus.DELIVERED,
    ServiceRequestStatus.COMPLETED,
  ];
  if (!reportable.includes(request.status))
    throw new WorkflowError("Bu aşamada sorun bildirilemez.");

  await prisma.$transaction(async (tx) => {
    await tx.problemReport.create({
      data: {
        serviceRequestId: requestId,
        reporterId: userId,
        type: input.type as ProblemType,
        description: input.description,
        media: input.media,
        status: ProblemStatus.OPEN,
      },
    });
    // Tamamlanan işi tekrar "sorun" durumuna almıyoruz; devam edenleri işaretle.
    if (request.status !== ServiceRequestStatus.COMPLETED) {
      await tx.serviceRequest.update({
        where: { id: requestId },
        data: { status: ServiceRequestStatus.PROBLEM_REPORTED },
      });
    }
    await addSystemMessageTx(
      tx,
      requestId,
      "Bir sorun bildirildi. Ekibimiz inceleyecek.",
    );
  });

  const otherId = isCustomer ? request.payment!.providerId : request.customerId;
  await notify(otherId, {
    type: "PROBLEM_REPORTED",
    title: "Bir sorun bildirildi",
    body: `"${request.title}" için bir sorun bildirildi. Ekibimiz inceleyecek.`,
    link: isCustomer ? `/panel/hizmet-ver/${requestId}` : `/panel/hizmet-al/${requestId}`,
  });

  return { ok: true };
}

/** İş iptali (randevu öncesi/başlamadan). */
export async function cancelJob(
  userId: string,
  requestId: string,
  reason: string,
) {
  const request = await loadJob(requestId);
  if (!request) throw new WorkflowError("Talep bulunamadı.");
  const isCustomer = request.customerId === userId;
  const isProvider = request.payment?.providerId === userId;
  if (!isCustomer && !isProvider)
    throw new WorkflowError("Bu işi iptal edemezsin.");

  const cancellable: ServiceRequestStatus[] = [
    ServiceRequestStatus.OFFER_SELECTED,
    ServiceRequestStatus.SCHEDULED,
  ];
  if (!cancellable.includes(request.status))
    throw new WorkflowError("İş başladıktan sonra iptal edilemez, sorun bildir.");

  await prisma.$transaction(async (tx) => {
    await tx.serviceRequest.update({
      where: { id: requestId },
      data: { status: ServiceRequestStatus.CANCELLED },
    });
    await addSystemMessageTx(tx, requestId, `İş iptal edildi. Neden: ${reason}`);
  });

  const otherId = isCustomer ? request.payment!.providerId : request.customerId;
  await notify(otherId, {
    type: "JOB_CANCELLED",
    title: "İş iptal edildi",
    body: `"${request.title}" iptal edildi. Neden: ${reason}`,
    link: isCustomer ? `/panel/hizmet-ver` : `/panel/hizmet-al`,
  });

  return { ok: true };
}
