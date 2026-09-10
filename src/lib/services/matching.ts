import { prisma } from "@/lib/prisma";
import { notifyMany } from "@/lib/services/notifications";
import { getPreferences } from "@/lib/services/preferences";
import { sendEmail, sendSms } from "@/lib/services/channels";

/**
 * Yeni bir talep açıldığında, o kategoriye ve (varsa) şehre uyan hizmet
 * verenlere "sana uygun yeni talep" bildirimi gönderir.
 * Bildirim tercihi (newMatch) kapalı olanlar atlanır. Talebi açan hariç tutulur.
 */
export async function notifyMatchingProviders(requestId: string) {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      title: true,
      city: true,
      customerId: true,
      category: { select: { id: true, name: true, parentId: true } },
    },
  });
  if (!request) return;

  // Talebin üst (ana) kategorisi — hizmet verenler ana kategori seçer.
  const topCatId = request.category.parentId ?? request.category.id;

  // Bu kategoride hizmet veren profiller.
  const profiles = await prisma.providerProfile.findMany({
    where: { categories: { some: { id: topCatId } } },
    select: { userId: true, city: true },
    take: 500,
  });

  // Şehir eşleşenleri öne al ama hepsini bilgilendir (1. yıl, taban küçük).
  const candidates = profiles.filter((p) => p.userId !== request.customerId);
  if (candidates.length === 0) return;

  // Tercihleri kontrol et (newMatch kapalıysa atla).
  const eligible: { userId: string; city: string | null }[] = [];
  for (const c of candidates) {
    const pref = await getPreferences(c.userId);
    if (pref.newMatch) eligible.push(c);
  }
  if (eligible.length === 0) return;

  await notifyMany(
    eligible.map((e) => e.userId),
    {
      type: "NEW_MATCH",
      title: "Sana uygun yeni bir talep var 🎯",
      body: `${request.category.name}${request.city ? ` · ${request.city}` : ""}: "${request.title}"`,
      link: "/panel/hizmet-ver",
    },
  );

  // Harici kanallar (e-posta/SMS) — yapılandırıldıysa ve tercih açıksa.
  await dispatchExternalMatches(eligible.map((e) => e.userId), request.title);
}

async function dispatchExternalMatches(userIds: string[], title: string) {
  if (userIds.length === 0) return;
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, phone: true },
  });
  for (const u of users) {
    const pref = await getPreferences(u.id);
    if (pref.emailEnabled && u.email) {
      await sendEmail(u.email, "Sana uygun yeni bir talep var", `"${title}" talebine teklif verebilirsin.`);
    }
    if (pref.smsEnabled && u.phone) {
      await sendSms(u.phone, `İşKalkan: sana uygun yeni talep — "${title}".`);
    }
  }
}

/**
 * Acil yardım talebi: SADECE aynı şehirdeki, o kategoride ve aynı gün müsait
 * hizmet verenlere öncelikli "acil" bildirimi gönderir.
 */
export async function notifyEmergencyProviders(requestId: string) {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      title: true,
      city: true,
      customerId: true,
      category: { select: { id: true, name: true, parentId: true } },
    },
  });
  if (!request) return;

  const topCatId = request.category.parentId ?? request.category.id;

  const profiles = await prisma.providerProfile.findMany({
    where: {
      categories: { some: { id: topCatId } },
      sameDayAvailable: true,
      ...(request.city ? { city: request.city } : {}),
      user: { isActive: true, isBanned: false },
    },
    select: { userId: true },
    take: 200,
  });

  const targets = profiles
    .map((p) => p.userId)
    .filter((id) => id !== request.customerId);
  if (targets.length === 0) return;

  await notifyMany(targets, {
    type: "EMERGENCY_REQUEST",
    title: "🚨 Acil yardım talebi!",
    body: `${request.category.name}${request.city ? ` · ${request.city}` : ""}: "${request.title}" — hemen teklif verebilirsin.`,
    link: "/panel/hizmet-ver",
  });

  // Acil durumlarda harici kanallar da (varsa) tetiklenir.
  await dispatchExternalMatches(targets, request.title).catch(() => {});
}

/**
 * Hizmet verene önerilen açık talepler (kategori + şehir + bütçe skoruna göre).
 * Kendi talepleri ve zaten teklif verdikleri hariç.
 */
export async function getRecommendedRequestsForProvider(userId: string, take = 6) {
  const profile = await prisma.providerProfile.findUnique({
    where: { userId },
    select: { city: true, categories: { select: { id: true } } },
  });
  if (!profile || profile.categories.length === 0) return [];

  const topCatIds = profile.categories.map((c) => c.id);

  // Bu üst kategoriler + alt kategorileri.
  const cats = await prisma.serviceCategory.findMany({
    where: { OR: [{ id: { in: topCatIds } }, { parentId: { in: topCatIds } }] },
    select: { id: true },
  });
  const catIds = cats.map((c) => c.id);

  const myOffers = await prisma.offer.findMany({
    where: { providerId: userId },
    select: { serviceRequestId: true },
  });
  const offered = new Set(myOffers.map((o) => o.serviceRequestId));

  const requests = await prisma.serviceRequest.findMany({
    where: {
      status: "OPEN",
      categoryId: { in: catIds },
      customerId: { not: userId },
    },
    orderBy: { createdAt: "desc" },
    take: 40,
    select: {
      id: true,
      title: true,
      city: true,
      district: true,
      budgetMin: true,
      budgetMax: true,
      urgency: true,
      createdAt: true,
      category: { select: { name: true } },
      _count: { select: { offers: true } },
    },
  });

  const scored = requests
    .filter((r) => !offered.has(r.id))
    .map((r) => {
      const reasons: string[] = ["Uzmanlık alanın"];
      let score = 10;
      if (profile.city && r.city && profile.city.toLowerCase() === r.city.toLowerCase()) {
        score += 5;
        reasons.push("Şehrin");
      }
      if (r.urgency === "URGENT") {
        score += 3;
        reasons.push("Acil");
      }
      if (r._count.offers < 3) {
        score += 2;
        reasons.push("Az teklif");
      }
      return { ...r, score, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, take);

  return scored;
}
