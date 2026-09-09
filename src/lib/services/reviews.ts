import { ServiceRequestStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/services/notifications";
import type { ReviewInput } from "@/lib/validations/service";

export class ReviewError extends Error {}

/** Bir talebe ait değerlendirmeyi döndürür (yoksa null). */
export async function getReviewForRequest(requestId: string) {
  return prisma.review.findUnique({
    where: { serviceRequestId: requestId },
    select: { id: true, rating: true, comment: true, createdAt: true },
  });
}

/** Bir hizmet verenin aldığı son değerlendirmeler. */
export async function listReviewsForProvider(providerId: string, take = 20) {
  return prisma.review.findMany({
    where: { targetId: providerId },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      author: { select: { fullName: true } },
    },
  });
}

/**
 * Müşteri, tamamlanmış bir işin hizmet verenini değerlendirir.
 * İşlem sonunda hizmet verenin puan ortalaması yeniden hesaplanır.
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
        comment: input.comment,
      },
    });

    // Hizmet verenin puan ortalamasını ve adedini güncelle.
    const agg = await tx.review.aggregate({
      where: { targetId: providerId },
      _avg: { rating: true },
      _count: true,
    });
    await tx.providerProfile.updateMany({
      where: { userId: providerId },
      data: {
        ratingAvg: agg._avg.rating ?? 0,
        ratingCount: agg._count,
      },
    });

    return review;
  });

  // Hizmet verene bildirim
  await notify(providerId, {
    type: "REVIEW_RECEIVED",
    title: "Yeni değerlendirme aldın ⭐",
    body: `Bir müşteri sana ${input.rating}/5 puan verdi.`,
    link: `/panel/hizmet-ver/${requestId}`,
  });

  return created;
}
