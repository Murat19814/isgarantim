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
    workDays: input.workDays,
    workStart: input.workStart || null,
    workEnd: input.workEnd || null,
    sameDayAvailable: input.sameDayAvailable,
    gender: input.gender || null,
    worksWithTeam: input.worksWithTeam,
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
      workDays: true,
      workStart: true,
      workEnd: true,
      sameDayAvailable: true,
      gender: true,
      worksWithTeam: true,
      ratingAvg: true,
      ratingCount: true,
      completedJobs: true,
      avgResponseMin: true,
      trustScore: true,
      level: true,
      categories: { select: { id: true, name: true } },
      user: { select: { id: true, fullName: true, avatarUrl: true, createdAt: true, isFounder: true } },
    },
  });
  if (!profile) return null;

  const { computeTrustScore } = await import("@/lib/services/trust");
  const [badges, reviews, repeatRate, neighborStats, trust, criteriaAgg] = await Promise.all([
    getUserBadges(userId),
    listReviewsForProvider(userId, 10),
    computeRepeatRate(userId),
    getNeighborhoodStats(userId),
    computeTrustScore(userId),
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

  return { profile, badges, reviews, repeatRate, neighborStats, trust, criteriaAvg: criteriaAgg._avg };
}

/**
 * "Komşum kullandı": son 30 günde tamamlanan işlerin ilçe bazlı özeti.
 * Tam adres GÖSTERİLMEZ; yalnızca ilçe/şehir ve iş sayısı.
 */
export async function getNeighborhoodStats(providerId: string) {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const completed = await prisma.serviceRequest.findMany({
    where: {
      status: ServiceRequestStatus.COMPLETED,
      completedAt: { gte: since },
      payment: { providerId },
    },
    select: { city: true, district: true },
  });

  if (completed.length === 0) return { total: 0, topArea: null as string | null };

  const counts = new Map<string, number>();
  for (const r of completed) {
    const area = r.district || r.city;
    if (!area) continue;
    counts.set(area, (counts.get(area) ?? 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return { total: completed.length, topArea: top ? top[0] : null };
}

const WEEKDAY_KEYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/**
 * Bugün müsait (aynı gün hizmet veren) profilleri listeler.
 * sameDayAvailable=true, bugün çalışma gününde ve tatil değilse.
 */
export async function listSameDayProviders(opts?: { city?: string; take?: number }) {
  const now = new Date();
  const todayKey = WEEKDAY_KEYS[now.getDay()];
  const todayStr = now.toISOString().slice(0, 10);

  const profiles = await prisma.providerProfile.findMany({
    where: {
      sameDayAvailable: true,
      ...(opts?.city ? { city: opts.city } : {}),
      user: { isActive: true, isBanned: false },
    },
    orderBy: [{ ratingAvg: "desc" }, { completedJobs: "desc" }],
    take: (opts?.take ?? 8) * 2,
    select: {
      headline: true,
      city: true,
      ratingAvg: true,
      ratingCount: true,
      completedJobs: true,
      avgResponseMin: true,
      workDays: true,
      daysOff: true,
      user: { select: { id: true, fullName: true, avatarUrl: true, isFounder: true } },
    },
  });

  const available = profiles.filter((p) => {
    if (p.daysOff.includes(todayStr)) return false;
    if (p.workDays.length > 0 && !p.workDays.includes(todayKey)) return false;
    return true;
  });

  return available.slice(0, opts?.take ?? 8);
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
