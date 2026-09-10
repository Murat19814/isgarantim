import {
  OfferStatus,
  ServiceRequestStatus,
  PaymentStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MAX_OFFERS_PER_REQUEST } from "@/lib/constants";
import { notify } from "@/lib/services/notifications";
import type { OfferInput } from "@/lib/validations/service";

export class OfferError extends Error {}

/** Hizmet verenin profili doğrulanmış mı? (1. yıl: e-posta veya telefon yeterli) */
async function assertVerifiedProvider(providerId: string) {
  const u = await prisma.user.findUnique({
    where: { id: providerId },
    select: { emailVerified: true, phoneVerified: true, isBanned: true, isActive: true },
  });
  if (!u) throw new OfferError("Kullanıcı bulunamadı.");
  if (u.isBanned || !u.isActive) throw new OfferError("Hesabın teklif veremez durumda.");
  if (!u.emailVerified && !u.phoneVerified)
    throw new OfferError("Teklif vermek için önce profilini doğrulamalısın (e-posta veya telefon).");
}

/**
 * Hizmet veren teklif verir — 1. YIL ÜCRETSİZ (kontör yok).
 * Kurallar:
 *  - Sadece doğrulanmış profiller teklif verebilir.
 *  - Bir talebe en fazla MAX_OFFERS_PER_REQUEST hizmet veren teklif verebilir.
 *  - Aynı kişi aynı talebe yalnızca 1 teklif verir (güncelleme için updateOffer).
 */
export async function createOffer(
  providerId: string,
  requestId: string,
  input: OfferInput,
) {
  await assertVerifiedProvider(providerId);

  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    select: { id: true, customerId: true, status: true, title: true },
  });

  if (!request) throw new OfferError("Hizmet talebi bulunamadı.");
  if (request.status !== ServiceRequestStatus.OPEN)
    throw new OfferError("Bu talep artık teklif kabul etmiyor.");
  if (request.customerId === providerId)
    throw new OfferError("Kendi talebine teklif veremezsin.");

  const existing = await prisma.offer.findUnique({
    where: { serviceRequestId_providerId: { serviceRequestId: requestId, providerId } },
  });
  if (existing) throw new OfferError("Bu talebe zaten teklif verdin. Teklifini güncelleyebilirsin.");

  // En fazla 5 teklif (aktif/bekleyen)
  const count = await prisma.offer.count({
    where: { serviceRequestId: requestId, status: OfferStatus.PENDING },
  });
  if (count >= MAX_OFFERS_PER_REQUEST)
    throw new OfferError(
      `Bu talep en fazla ${MAX_OFFERS_PER_REQUEST} teklif alabilir ve doldu.`,
    );

  const offer = await prisma.offer.create({
    data: {
      serviceRequestId: requestId,
      providerId,
      price: input.price,
      estimatedDuration: input.estimatedDuration,
      message: input.message,
      availability: input.availability,
      materialsIncluded: input.materialsIncluded,
      onSiteInspection: input.onSiteInspection,
      creditCost: 0,
      status: OfferStatus.PENDING,
    },
  });

  // Müşteriye bildirim
  await notify(request.customerId, {
    type: "OFFER_RECEIVED",
    title: "Yeni teklif aldın",
    body: `"${request.title}" talebine yeni bir teklif geldi.`,
    link: `/panel/hizmet-al/${requestId}`,
  });

  return offer;
}

/**
 * Hizmet veren kendi teklifini günceller (talep hâlâ açıkken ve teklif PENDING iken).
 */
export async function updateOffer(
  providerId: string,
  requestId: string,
  input: OfferInput,
) {
  await assertVerifiedProvider(providerId);

  const offer = await prisma.offer.findUnique({
    where: { serviceRequestId_providerId: { serviceRequestId: requestId, providerId } },
    include: { serviceRequest: { select: { status: true, customerId: true, title: true } } },
  });
  if (!offer) throw new OfferError("Güncellenecek teklif bulunamadı.");
  if (offer.status !== OfferStatus.PENDING)
    throw new OfferError("Bu teklif artık güncellenemez.");
  if (offer.serviceRequest.status !== ServiceRequestStatus.OPEN)
    throw new OfferError("Talep artık teklif kabul etmiyor.");

  const updated = await prisma.offer.update({
    where: { id: offer.id },
    data: {
      price: input.price,
      estimatedDuration: input.estimatedDuration,
      message: input.message,
      availability: input.availability,
      materialsIncluded: input.materialsIncluded,
      onSiteInspection: input.onSiteInspection,
    },
  });

  await notify(offer.serviceRequest.customerId, {
    type: "OFFER_UPDATED",
    title: "Bir teklif güncellendi",
    body: `"${offer.serviceRequest.title}" talebindeki bir teklif güncellendi.`,
    link: `/panel/hizmet-al/${requestId}`,
  });

  return updated;
}

/**
 * Müşteri kazanan teklifi seçer — 1. YIL ÜCRETSİZ (kontör kesintisi yok).
 *  - Kazanan WON, diğerleri LOST
 *  - Talep OFFER_SELECTED durumuna geçer
 *  - Raporlama için bir Payment kaydı (kararlaştırılan tutar) oluşturulur;
 *    ödeme tahsilatı 1. yıl kapalı, taraflar doğrudan anlaşır.
 */
export async function selectOffer(
  customerId: string,
  requestId: string,
  offerId: string,
) {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: { offers: true, payment: true },
  });
  const requestTitle = request?.title ?? "talebin";

  if (!request) throw new OfferError("Talep bulunamadı.");
  if (request.customerId !== customerId)
    throw new OfferError("Bu talep sana ait değil.");
  if (request.status !== ServiceRequestStatus.OPEN)
    throw new OfferError("Bu talep için zaten bir seçim yapılmış.");

  const winner = request.offers.find((o) => o.id === offerId);
  if (!winner) throw new OfferError("Teklif bulunamadı.");
  if (winner.status !== OfferStatus.PENDING)
    throw new OfferError("Bu teklif seçilebilir durumda değil.");

  const result = await prisma.$transaction(async (tx) => {
    await tx.offer.update({
      where: { id: winner.id },
      data: { status: OfferStatus.WON },
    });

    // Diğer teklifler: LOST
    for (const other of request.offers) {
      if (other.id === winner.id) continue;
      if (other.status !== OfferStatus.PENDING) continue;
      await tx.offer.update({
        where: { id: other.id },
        data: { status: OfferStatus.LOST },
      });
    }

    await tx.serviceRequest.update({
      where: { id: request.id },
      data: { status: ServiceRequestStatus.OFFER_SELECTED },
    });

    // Raporlama amaçlı kayıt (ödeme tahsilatı 1. yıl kapalı)
    const payment = await tx.payment.create({
      data: {
        serviceRequestId: request.id,
        customerId,
        providerId: winner.providerId,
        amount: winner.price,
        status: PaymentStatus.PENDING,
      },
    });

    return { winnerId: winner.id, paymentId: payment.id };
  });

  // Kazanan hizmet verene bildirim
  await notify(winner.providerId, {
    type: "OFFER_WON",
    title: "Teklifin kabul edildi 🎉",
    body: `"${requestTitle}" için teklifin seçildi. Müşteriyle iletişime geçebilirsin.`,
    link: `/panel/hizmet-ver/${requestId}`,
  });

  // Kaybedenlere bilgi
  for (const other of request.offers) {
    if (other.id === winner.id) continue;
    await notify(other.providerId, {
      type: "OFFER_LOST",
      title: "Teklifin seçilmedi",
      body: `"${requestTitle}" için başka bir teklif seçildi.`,
      link: `/panel/hizmet-ver`,
    });
  }

  return result;
}

/** Hizmet verenin verdiği teklifler. */
export async function listProviderOffers(providerId: string) {
  return prisma.offer.findMany({
    where: { providerId },
    orderBy: { createdAt: "desc" },
    include: {
      serviceRequest: { select: { id: true, title: true, city: true, status: true } },
    },
  });
}
