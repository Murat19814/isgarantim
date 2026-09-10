import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/services/notifications";

/**
 * Davet ödül kademeleri — PARASAL DEĞİL. Rozet/unvan ve kurucu üyelik.
 * `min` = geçerli (doğrulanmış) davet sayısı.
 */
export const REFERRAL_TIERS = [
  { min: 1, label: "Davetçi", founder: false },
  { min: 3, label: "Elçi", founder: false },
  { min: 5, label: "Kurucu Üye", founder: true },
  { min: 10, label: "Topluluk Lideri", founder: true },
] as const;

export function tierFor(count: number) {
  let current: (typeof REFERRAL_TIERS)[number] | null = null;
  for (const t of REFERRAL_TIERS) if (count >= t.min) current = t;
  return current;
}

export function nextTier(count: number) {
  return REFERRAL_TIERS.find((t) => count > -1 && count < t.min) ?? null;
}

function makeCode(): string {
  // 8 karakter, karışması zor (0/O, 1/I hariç)
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const buf = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) out += alphabet[buf[i] % alphabet.length];
  return out;
}

/** Kullanıcının davet kodunu döndürür; yoksa üretip kaydeder. */
export async function ensureReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });
  if (user?.referralCode) return user.referralCode;

  // Çakışmaya karşı birkaç deneme
  for (let i = 0; i < 6; i++) {
    const code = makeCode();
    try {
      await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
      return code;
    } catch {
      // unique çakışması — tekrar dene
    }
  }
  throw new Error("Davet kodu üretilemedi.");
}

/**
 * Kayıt sırasında davet kodunu uygular.
 * Anti-fraud: kendini davet edemez, kod geçerli olmalı, bir kullanıcı yalnız bir kez atfedilir.
 */
export async function applyReferralOnRegister(newUserId: string, code: string) {
  const inviter = await prisma.user.findUnique({
    where: { referralCode: code.trim().toUpperCase() },
    select: { id: true },
  });
  if (!inviter) return; // geçersiz kod — sessizce geç
  if (inviter.id === newUserId) return; // kendini davet edemez

  await prisma.user.update({
    where: { id: newUserId },
    data: { referredById: inviter.id },
  });
}

/** Geçerli davet sayısı: davet edilen + (e-posta VEYA telefon doğrulanmış) kullanıcılar. */
export async function countValidReferrals(inviterId: string): Promise<number> {
  return prisma.user.count({
    where: {
      referredById: inviterId,
      OR: [{ emailVerified: { not: null } }, { phoneVerified: { not: null } }],
    },
  });
}

/**
 * Bir kullanıcı doğrulandığında davet edenin ödüllerini yeniden hesaplar.
 * Yeni kademeye ulaşıldıysa rozet/kurucu üyelik verir ve bildirim yollar.
 */
export async function recomputeReferralRewards(verifiedUserId: string) {
  const user = await prisma.user.findUnique({
    where: { id: verifiedUserId },
    select: { referredById: true },
  });
  if (!user?.referredById) return;

  const inviterId = user.referredById;
  const count = await countValidReferrals(inviterId);
  const tier = tierFor(count);
  if (!tier) return;

  const inviter = await prisma.user.findUnique({
    where: { id: inviterId },
    select: { referralMilestone: true, isFounder: true },
  });
  if (!inviter) return;

  // Yeni bir kademeye ulaşıldı mı?
  if (tier.min > inviter.referralMilestone) {
    await prisma.user.update({
      where: { id: inviterId },
      data: {
        referralMilestone: tier.min,
        isFounder: inviter.isFounder || tier.founder,
      },
    });
    await notify(inviterId, {
      type: "REFERRAL_REWARD",
      title: tier.founder ? "Kurucu Üye oldun 🏅" : `Yeni rozet: ${tier.label} 🎉`,
      body: `${count} geçerli davetinle "${tier.label}" unvanını kazandın. Teşekkürler!`,
      link: "/davet",
    });
  }
}

/** /davet sayfası için özet. */
export async function getReferralSummary(userId: string) {
  const code = await ensureReferralCode(userId);
  const [count, me, joined] = await Promise.all([
    countValidReferrals(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { isFounder: true } }),
    prisma.user.findMany({
      where: { referredById: userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        fullName: true,
        createdAt: true,
        emailVerified: true,
        phoneVerified: true,
      },
    }),
  ]);

  return {
    code,
    validCount: count,
    totalInvited: joined.length,
    isFounder: me?.isFounder ?? false,
    tier: tierFor(count),
    next: nextTier(count),
    invitees: joined.map((j) => ({
      fullName: j.fullName,
      joinedAt: j.createdAt.toISOString(),
      verified: !!(j.emailVerified || j.phoneVerified),
    })),
  };
}
