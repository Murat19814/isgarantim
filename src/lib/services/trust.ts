import { ServiceRequestStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getUserBadges } from "@/lib/services/verification";
import { TRUST_LEVELS, levelFor } from "@/lib/levels";

export { TRUST_LEVELS, levelFor };

export type TrustFactor = { label: string; points: number; max: number };
export type TrustResult = {
  score: number;
  level: (typeof TRUST_LEVELS)[number];
  factors: TrustFactor[];
};

/**
 * Çok faktörlü güven puanı (0-100). Kullanıcıya nasıl oluştuğu açıklanır.
 * Faktörler: kimlik/telefon doğrulaması, puan, tamamlanan iş, tekrar tercih,
 * düşük şikâyet oranı.
 */
export async function computeTrustScore(providerId: string): Promise<TrustResult> {
  const profile = await prisma.providerProfile.findUnique({
    where: { userId: providerId },
    select: { ratingAvg: true, ratingCount: true, completedJobs: true },
  });
  const rating = profile?.ratingAvg ?? 0;
  const completedJobs = profile?.completedJobs ?? 0;

  const badges = await getUserBadges(providerId).catch(() => ({}) as Record<string, boolean>);

  // Tekrar tercih oranı
  const completed = await prisma.serviceRequest.findMany({
    where: { status: ServiceRequestStatus.COMPLETED, payment: { providerId } },
    select: { customerId: true },
  });
  const counts = new Map<string, number>();
  for (const c of completed) counts.set(c.customerId, (counts.get(c.customerId) ?? 0) + 1);
  const repeatJobs = [...counts.values()].filter((n) => n > 1).reduce((a, b) => a + b, 0);
  const repeatRate = completed.length ? repeatJobs / completed.length : 0;

  // Şikâyet oranı (çözülmemiş/toplam sorun bildirimleri)
  const problemCount = await prisma.problemReport.count({
    where: { serviceRequest: { payment: { providerId } } },
  });
  const complaintRatio = completed.length ? problemCount / completed.length : 0;

  const factors: TrustFactor[] = [
    { label: "Kimlik doğrulaması", points: badges["IDENTITY"] ? 20 : 0, max: 20 },
    { label: "Telefon doğrulaması", points: badges["PHONE"] ? 10 : 0, max: 10 },
    { label: "E-posta doğrulaması", points: badges["EMAIL"] ? 5 : 0, max: 5 },
    { label: "Müşteri puanı", points: Math.round((rating / 5) * 30), max: 30 },
    { label: "Tamamlanan iş", points: Math.round((Math.min(completedJobs, 50) / 50) * 20), max: 20 },
    { label: "Tekrar tercih edilme", points: Math.round(repeatRate * 10), max: 10 },
    {
      label: "Düşük şikâyet oranı",
      points: Math.max(0, Math.round(5 - complaintRatio * 20)),
      max: 5,
    },
  ];

  const raw = factors.reduce((a, f) => a + f.points, 0);
  const score = Math.max(0, Math.min(100, raw));
  const level = levelFor(completedJobs, rating);

  return { score, level, factors };
}

/** Güven puanı + seviyeyi hesaplar ve profile yazar (hata güvenli). */
export async function recomputeTrust(providerId: string) {
  try {
    const { score, level } = await computeTrustScore(providerId);
    await prisma.providerProfile.updateMany({
      where: { userId: providerId },
      data: { trustScore: score, level: level.key },
    });
  } catch {
    // Ana akışı bozma
  }
}
