import { ServiceRequestStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getUserBadges } from "@/lib/services/verification";
import { listReviewsForProvider } from "@/lib/services/reviews";
import type { ProviderProfileInput } from "@/lib/validations/profile";

/** Hizmet verenin kendi profilini düzenlemesi için mevcut veriyi getirir. */
export async function getMyProviderProfile(userId: string) {
  const profile = await prisma.providerProfile.findUnique({
    where: { userId },
    include: { categories: { select: { id: true } } },
  });
  return profile;
}

/** Profil oluştur/güncelle (upsert) + kategori bağla. */
export async function upsertProviderProfile(
  userId: string,
  input: ProviderProfileInput,
) {
  const data = {
    headline: input.headline || null,
    bio: input.bio || null,
    city: input.city || null,
    district: input.district || null,
    coverUrl: input.coverUrl || null,
    experienceYears: input.experienceYears ?? null,
    availabilityNote: input.availabilityNote || null,
    serviceAreas: input.serviceAreas,
    portfolio: input.portfolio,
  };

  return prisma.providerProfile.upsert({
    where: { userId },
    update: {
      ...data,
      categories: { set: input.categoryIds.map((id) => ({ id })) },
    },
    create: {
      userId,
      ...data,
      categories: { connect: input.categoryIds.map((id) => ({ id })) },
    },
    select: { id: true },
  });
}

/**
 * Herkese açık profil. Belge içeriği/telefon GÖSTERİLMEZ.
 * Rozetler, portföy, puanlar, tamamlanan iş, tekrar tercih oranı döner.
 */
export async function getPublicProviderProfile(userId: string) {
  const profile = await prisma.providerProfile.findUnique({
    where: { userId },
    select: {
      headline: true,
      bio: true,
      city: true,
      district: true,
      coverUrl: true,
      portfolio: true,
      serviceAreas: true,
      experienceYears: true,
      availabilityNote: true,
      ratingAvg: true,
      ratingCount: true,
      completedJobs: true,
      avgResponseMin: true,
      categories: { select: { id: true, name: true } },
      user: { select: { id: true, fullName: true, avatarUrl: true, createdAt: true, isFounder: true } },
    },
  });
  if (!profile) return null;

  const [badges, reviews, repeatRate, criteriaAgg] = await Promise.all([
    getUserBadges(userId),
    listReviewsForProvider(userId, 10),
    computeRepeatRate(userId),
    prisma.review.aggregate({
      where: { targetId: userId, isHidden: false },
      _avg: {
        qualityRating: true,
        punctualityRating: true,
        communicationRating: true,
        priceRating: true,
        cleanlinessRating: true,
      },
    }),
  ]);

  return { profile, badges, reviews, repeatRate, criteriaAvg: criteriaAgg._avg };
}

/** Tekrar tercih edilme oranı: birden fazla iş veren müşterilerin oranı. */
async function computeRepeatRate(providerId: string) {
  const completed = await prisma.serviceRequest.findMany({
    where: {
      status: ServiceRequestStatus.COMPLETED,
      payment: { providerId },
    },
    select: { customerId: true },
  });
  if (completed.length === 0) return 0;
  const counts = new Map<string, number>();
  for (const c of completed) counts.set(c.customerId, (counts.get(c.customerId) ?? 0) + 1);
  const repeatJobs = [...counts.values()].filter((n) => n > 1).reduce((a, b) => a + b, 0);
  return Math.round((repeatJobs / completed.length) * 100);
}
