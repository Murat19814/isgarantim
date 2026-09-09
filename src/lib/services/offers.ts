import {
  OfferStatus,
  ServiceRequestStatus,
  PaymentStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  holdCreditsTx,
  captureCreditsTx,
  refundCreditsTx,
  InsufficientCreditsError,
} from "@/lib/services/credits";
import { DEFAULT_OFFER_CREDIT_COST } from "@/lib/constants";
import { notify } from "@/lib/services/notifications";
import type { OfferInput } from "@/lib/validations/service";

export class OfferError extends Error {}

/**
 * Hizmet veren teklif verir.
 * Teklif verilince DEFAULT_OFFER_CREDIT_COST kadar kontör BEKLEMEYE alınır.
 * Kontör rezervasyonu + teklif oluşturma tek atomik blokta yapılır.
 */
export async function createOffer(
  providerId: string,
  requestId: string,
  input: OfferInput,
) {
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
  if (existing) throw new OfferError("Bu talebe zaten teklif verdin.");

  const cost = DEFAULT_OFFER_CREDIT_COST;

  try {
    const offer = await prisma.$transaction(async (tx) => {
      const created = await tx.offer.create({
        data: {
          serviceRequestId: requestId,
          providerId,
          price: input.price,
          estimatedDuration: input.estimatedDuration,
          message: input.message,
          creditCost: cost,
          status: OfferStatus.PENDING,
        },
      });
      // Kontörü beklemeye al
      await holdCreditsTx(tx, providerId, cost, created.id);
      return created;
    });

    // Müşteriye bildirim
    await notify(request.customerId, {
      type: "OFFER_RECEIVED",
      title: "Yeni teklif aldın",
      body: `"${request.title}" talebine yeni bir teklif geldi.`,
      link: `/panel/hizmet-al/${requestId}`,
    });

    return offer;
  } catch (e) {
    if (e instanceof InsufficientCreditsError) throw new OfferError(e.message);
    throw e;
  }
}

/**
 * Müşteri kazanan teklifi seçer.
 *  - Kazananın kontörü KESİN kesilir (CAPTURE)
 *  - Diğer bekleyen tekliflerin kontörü İADE edilir (REFUND)
 *  - Talep OFFER_SELECTED durumuna geçer
 *  - Emanet ödeme için PENDING bir Payment kaydı oluşturulur (Faz 4 fonlar)
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
    // Kazanan: kontör kesin kesilir
    await captureCreditsTx(tx, winner.providerId, winner.creditCost, winner.id);
    await tx.offer.update({
      where: { id: winner.id },
      data: { status: OfferStatus.WON },
    });

    // Kaybedenler: kontör iade
    for (const other of request.offers) {
      if (other.id === winner.id) continue;
      if (other.status !== OfferStatus.PENDING) continue;
      await refundCreditsTx(tx, other.providerId, other.creditCost, other.id);
      await tx.offer.update({
        where: { id: other.id },
        data: { status: OfferStatus.LOST },
      });
    }

    // Talep durumunu güncelle
    await tx.serviceRequest.update({
      where: { id: request.id },
      data: { status: ServiceRequestStatus.OFFER_SELECTED },
    });

    // Emanet ödeme kaydı (Faz 4'te fonlanacak)
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
    body: `"${requestTitle}" için teklifin seçildi. Müşteri ödemeyi emanete alınca işe başlayabilirsin.`,
    link: `/panel/hizmet-ver/${requestId}`,
  });

  // Kaybedenlere bilgi
  for (const other of request.offers) {
    if (other.id === winner.id) continue;
    await notify(other.providerId, {
      type: "OFFER_LOST",
      title: "Teklifin seçilmedi",
      body: `"${requestTitle}" için başka bir teklif seçildi. Kontörün iade edildi.`,
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
