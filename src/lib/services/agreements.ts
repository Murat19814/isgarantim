import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/services/notifications";
import type { AgreementInput } from "@/lib/validations/service";

export class AgreementError extends Error {}

/** Talebin tarafları (müşteri + kazanan hizmet veren) ve rolü. */
async function getParties(requestId: string, userId: string) {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      customerId: true,
      title: true,
      payment: { select: { providerId: true, amount: true } },
    },
  });
  if (!request) throw new AgreementError("Talep bulunamadı.");
  const providerId = request.payment?.providerId ?? null;
  const isCustomer = request.customerId === userId;
  const isProvider = providerId === userId;
  if (!isCustomer && !isProvider)
    throw new AgreementError("Bu anlaşmaya erişemezsin.");
  return { request, providerId, isCustomer, isProvider };
}

export async function getAgreement(requestId: string) {
  return prisma.workAgreement.findUnique({ where: { serviceRequestId: requestId } });
}

/**
 * Anlaşma taslağını oluştur/güncelle. İçerik değişince iki tarafın da onayı sıfırlanır;
 * yalnızca değişikliği yapan tarafın onayı otomatik verilir.
 */
export async function upsertAgreement(
  userId: string,
  requestId: string,
  input: AgreementInput,
) {
  const { request, providerId, isCustomer } = await getParties(requestId, userId);
  if (!providerId)
    throw new AgreementError("Önce bir teklif seçilmeli, sonra anlaşma yapılabilir.");

  const data = {
    scope: input.scope,
    price: input.price,
    materialsIncluded: input.materialsIncluded,
    startDate: input.startDate ? new Date(input.startDate) : null,
    endDate: input.endDate ? new Date(input.endDate) : null,
    cancellationTerms: input.cancellationTerms || null,
    customerNote: input.customerNote || null,
    providerNote: input.providerNote || null,
    // Değişiklik yapan taraf otomatik onaylar, diğer taraf yeniden onaylamalı
    customerApproved: isCustomer,
    providerApproved: !isCustomer,
    customerApprovedAt: isCustomer ? new Date() : null,
    providerApprovedAt: !isCustomer ? new Date() : null,
  };

  const agreement = await prisma.workAgreement.upsert({
    where: { serviceRequestId: requestId },
    update: data,
    create: { serviceRequestId: requestId, createdById: userId, ...data },
  });

  // Karşı tarafa bildirim
  const otherId = isCustomer ? providerId : request.customerId;
  await notify(otherId, {
    type: "AGREEMENT_UPDATED",
    title: "İş anlaşması güncellendi",
    body: `"${request.title}" için anlaşma taslağı hazırlandı. İncele ve onayla.`,
    link: isCustomer ? `/panel/hizmet-ver/${requestId}` : `/panel/hizmet-al/${requestId}`,
  });

  return agreement;
}

/** Anlaşmayı onayla (ilgili taraf). İki taraf onaylayınca agreedPrice talebe işlenir. */
export async function approveAgreement(userId: string, requestId: string) {
  const { request, providerId, isCustomer } = await getParties(requestId, userId);
  const agreement = await prisma.workAgreement.findUnique({
    where: { serviceRequestId: requestId },
  });
  if (!agreement) throw new AgreementError("Onaylanacak anlaşma yok.");

  const updated = await prisma.workAgreement.update({
    where: { serviceRequestId: requestId },
    data: isCustomer
      ? { customerApproved: true, customerApprovedAt: new Date() }
      : { providerApproved: true, providerApprovedAt: new Date() },
  });

  if (updated.customerApproved && updated.providerApproved) {
    await prisma.serviceRequest.update({
      where: { id: requestId },
      data: { agreedPrice: updated.price },
    });
    const otherId = isCustomer ? providerId! : request.customerId;
    await notify(otherId, {
      type: "AGREEMENT_APPROVED",
      title: "Anlaşma onaylandı ✓",
      body: `"${request.title}" için iş anlaşması iki tarafça onaylandı.`,
      link: isCustomer ? `/panel/hizmet-ver/${requestId}` : `/panel/hizmet-al/${requestId}`,
    });
  }

  return updated;
}
