import { SubscriptionPlan } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { JOB_PLANS, type JobPlanId } from "@/lib/constants";
import type { CompanyInput } from "@/lib/validations/jobs";

export class CompanyError extends Error {}

/** Lansman kampanyası: her firmaya ilk 6 ilan ücretsiz. */
export const FREE_WELCOME_QUOTA = 6;
const FREE_WELCOME_REF = "FREE_WELCOME_LAUNCH";

/**
 * Firmaya bir defaya mahsus ücretsiz ilan hakkını tanımlar (yoksa oluşturur).
 * externalRef ile işaretlendiği için tekrar tekrar verilmez.
 */
export async function ensureWelcomeCredits(companyId: string) {
  const existing = await prisma.companySubscription.findFirst({
    where: { companyId, externalRef: FREE_WELCOME_REF },
    select: { id: true },
  });
  if (existing) return;
  try {
    await prisma.companySubscription.create({
      data: {
        companyId,
        plan: SubscriptionPlan.PACKAGE,
        postQuota: FREE_WELCOME_QUOTA,
        amount: 0,
        expiresAt: null, // süresiz — kullanılana kadar geçerli
        isActive: true,
        externalRef: FREE_WELCOME_REF,
      },
    });
  } catch (e) {
    // Yarış durumunda çift kayıt olursa sessizce geç
    console.error("[ensureWelcomeCredits] atlandı:", e);
  }
}

/** Kullanıcının ilk firmasını (aktif abonelikleriyle) getirir. */
export async function getMyCompany(userId: string) {
  const company = await prisma.company.findFirst({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!company) return null;

  // Ücretsiz lansman hakkını garanti et
  await ensureWelcomeCredits(company.id);

  return prisma.company.findUnique({
    where: { id: company.id },
    include: {
      subscriptions: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

/** Firma oluşturur veya günceller (kullanıcı başına tek firma varsayımı). */
export async function upsertCompany(userId: string, input: CompanyInput) {
  const existing = await prisma.company.findFirst({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" },
  });

  if (existing) {
    return prisma.company.update({
      where: { id: existing.id },
      data: {
        name: input.name,
        taxNumber: input.taxNumber,
        logoUrl: input.logoUrl,
        website: input.website,
        about: input.about,
        city: input.city,
      },
    });
  }

  return prisma.company.create({
    data: {
      ownerId: userId,
      name: input.name,
      taxNumber: input.taxNumber,
      logoUrl: input.logoUrl,
      website: input.website,
      about: input.about,
      city: input.city,
    },
  });
}

/** Kalan toplam ilan hakkı (aktif ve süresi geçmemiş aboneliklerden). */
export async function getRemainingQuota(companyId: string) {
  const now = new Date();
  const subs = await prisma.companySubscription.findMany({
    where: { companyId, isActive: true },
  });
  return subs
    .filter((s) => !s.expiresAt || s.expiresAt > now)
    .reduce((sum, s) => sum + s.postQuota, 0);
}

/**
 * Plan satın alımı (MOCK ödeme).
 * Gerçek entegrasyonda iyzico/PayTR ödemesi sonrası abonelik oluşturulur.
 */
export async function purchasePlan(userId: string, planId: JobPlanId) {
  const company = await prisma.company.findFirst({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" },
  });
  if (!company)
    throw new CompanyError("Önce firma profilini oluşturmalısın.");

  const plan = JOB_PLANS.find((p) => p.id === planId);
  if (!plan) throw new CompanyError("Geçersiz plan.");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + plan.days);

  return prisma.companySubscription.create({
    data: {
      companyId: company.id,
      plan: plan.id as SubscriptionPlan,
      postQuota: plan.quota,
      amount: plan.price,
      expiresAt,
      isActive: true,
      externalRef: `MOCK-${Date.now()}`,
    },
  });
}
