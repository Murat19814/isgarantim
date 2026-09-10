import { Prisma, ServiceRequestStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/services/notifications";
import type { ReviewInput } from "@/lib/validations/service";

export class ReviewError extends Error {}

/** Bir talebe ait değerlendirmeyi döndürür (yoksa null). */
export async function getReviewForRequest(requestId: string) {
  return prisma.review.findUnique({
    where: { serviceRequestId: requestId },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      qualityRating: true,
      punctualityRating: true,
      communicationRating: true,
      priceRating: true,
      cleanlinessRating: true,
      providerReply: true,
      providerRepliedAt: true,
    },
  });
}

/** Bir hizmet verenin aldığı son değerlendirmeler (gizlenenler hariç). */
export async function listReviewsForProvider(providerId: string, take = 20) {
  return prisma.review.findMany({
    where: { targetId: providerId, isHidden: false },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      qualityRating: true,
      punctualityRating: true,
      communicationRating: true,
      priceRating: true,
      cleanlinessRating: true,
      providerReply: true,
      providerRepliedAt: true,
      author: { select: { fullName: true } },
    },
  });
}

/** Ortalamayı gizli olmayan yorumlardan yeniden hesaplar. */
async function recomputeRating(
  tx: Prisma.TransactionClient | typeof prisma,
  providerId: string,
) {
  const agg = await tx.review.aggregate({
    where: { targetId: providerId, isHidden: false },
    _avg: { rating: true },
    _count: true,
  });
  await tx.providerProfile.updateMany({
    where: { userId: providerId },
    data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count },
  });
}

/**
 * Müşteri, tamamlanmış bir işin hizmet verenini değerlendirir (çok kriterli).
 * Sadece sistem üzerinden seçilmiş + tamamlanmış işlerde mümkündür (sahte yorumu engeller).
 */
export async function createReview(
  userId: string,
  requestId: string,
  input: ReviewInput,
) {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      customerId: true,
      status: true,
      review: { select: { id: true } },
      payment: { select: { providerId: true } },
    },
  });

  if (!request) throw new ReviewError("Talep bulunamadı.");
  if (request.customerId !== userId)
    throw new ReviewError("Bu talebi değerlendiremezsin.");
  if (request.status !== ServiceRequestStatus.COMPLETED)
    throw new ReviewError("Sadece tamamlanan işleri değerlendirebilirsin.");
  if (request.review)
    throw new ReviewError("Bu iş için zaten değerlendirme yaptın.");

  const providerId = request.payment?.providerId;
  if (!providerId)
    throw new ReviewError("Değerlendirilecek hizmet veren bulunamadı.");

  const created = await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        serviceRequestId: requestId,
        authorId: userId,
        targetId: providerId,
        rating: input.rating,
        qualityRating: input.qualityRating,
        punctualityRating: input.punctualityRating,
        communicationRating: input.communicationRating,
        priceRating: input.priceRating,
        cleanlinessRating: input.cleanlinessRating,
        comment: input.comment,
      },
    });
    await recomputeRating(tx, providerId);
    return review;
  });

  await notify(providerId, {
    type: "REVIEW_RECEIVED",
    title: "Yeni değerlendirme aldın ⭐",
    body: `Bir müşteri sana ${input.rating}/5 puan verdi.`,
    link: `/panel/hizmet-ver/${requestId}`,
  });

  return created;
}

/** Hizmet veren, aldığı yoruma bir kez yanıt verir. */
export async function replyToReview(
  providerId: string,
  reviewId: string,
  reply: string,
) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, targetId: true, providerReply: true, authorId: true, serviceRequestId: true },
  });
  if (!review) throw new ReviewError("Yorum bulunamadı.");
  if (review.targetId !== providerId)
    throw new ReviewError("Bu yoruma yanıt veremezsin.");
  if (review.providerReply)
    throw new ReviewError("Bu yoruma zaten yanıt verdin.");

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: { providerReply: reply, providerRepliedAt: new Date() },
    select: { id: true },
  });

  await notify(review.authorId, {
    type: "REVIEW_REPLIED",
    title: "Yorumuna yanıt geldi",
    body: "Hizmet veren değerlendirmene yanıt yazdı.",
    link: `/panel/hizmet-al/${review.serviceRequestId}`,
  });

  return updated;
}

/** Bir yorumu şikayet eder (admin incelemesine düşer). */
export async function reportReview(
  userId: string,
  reviewId: string,
  reason: string,
) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, authorId: true, targetId: true },
  });
  if (!review) throw new ReviewError("Yorum bulunamadı.");
  // Yorumun tarafları şikayet edebilir
  if (review.authorId !== userId && review.targetId !== userId)
    throw new ReviewError("Bu yorumu şikayet edemezsin.");

  return prisma.review.update({
    where: { id: reviewId },
    data: { reported: true, reportReason: reason },
    select: { id: true, reported: true },
  });
}

// ── ADMIN ──────────────────────────────────────

export async function listReportedReviews() {
  return prisma.review.findMany({
    where: { reported: true },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      rating: true,
      comment: true,
      reportReason: true,
      isHidden: true,
      createdAt: true,
      author: { select: { fullName: true } },
      target: { select: { id: true, fullName: true } },
    },
  });
}

export async function setReviewHidden(reviewId: string, hidden: boolean) {
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: { isHidden: hidden, reported: false },
    select: { id: true, targetId: true, isHidden: true },
  });
  await recomputeRating(prisma, review.targetId);
  return review;
}
