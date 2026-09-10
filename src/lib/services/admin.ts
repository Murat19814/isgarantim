import {
  UserRole,
  ServiceRequestStatus,
  PaymentStatus,
  DisputeStatus,
  JobPostingStatus,
  ProblemStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class AdminError extends Error {}

// ─────────────────────────────────────────────
// GELİŞMİŞ İSTATİSTİKLER
// ─────────────────────────────────────────────

export async function getAdvancedStats() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    newUsers30,
    newRequests30,
    completed30,
    byStatus,
    byCategory,
    byCity,
    topProviders,
    totalReferred,
    founders,
    topInvitersRaw,
  ] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: since } } }),
    prisma.serviceRequest.count({ where: { createdAt: { gte: since } } }),
    prisma.serviceRequest.count({
      where: { status: ServiceRequestStatus.COMPLETED, completedAt: { gte: since } },
    }),
    prisma.serviceRequest.groupBy({ by: ["status"], _count: true }),
    prisma.serviceRequest.groupBy({
      by: ["categoryId"],
      _count: true,
      orderBy: { _count: { categoryId: "desc" } },
      take: 8,
    }),
    prisma.serviceRequest.groupBy({
      by: ["city"],
      _count: true,
      orderBy: { _count: { city: "desc" } },
      take: 8,
    }),
    prisma.providerProfile.findMany({
      orderBy: [{ completedJobs: "desc" }, { ratingAvg: "desc" }],
      take: 10,
      select: {
        completedJobs: true,
        ratingAvg: true,
        ratingCount: true,
        user: { select: { id: true, fullName: true, isFounder: true } },
      },
    }),
    prisma.user.count({ where: { referredById: { not: null } } }),
    prisma.user.count({ where: { isFounder: true } }),
    prisma.user.groupBy({
      by: ["referredById"],
      where: { referredById: { not: null } },
      _count: true,
      orderBy: { _count: { referredById: "desc" } },
      take: 8,
    }),
  ]);

  // Kategori adlarını çöz
  const catIds = byCategory.map((c) => c.categoryId);
  const cats = await prisma.serviceCategory.findMany({
    where: { id: { in: catIds } },
    select: { id: true, name: true },
  });
  const catName = new Map(cats.map((c) => [c.id, c.name]));

  // En çok davet edenlerin adlarını çöz
  const inviterIds = topInvitersRaw.map((r) => r.referredById!).filter(Boolean);
  const inviters = await prisma.user.findMany({
    where: { id: { in: inviterIds } },
    select: { id: true, fullName: true, isFounder: true },
  });
  const inviterName = new Map(inviters.map((u) => [u.id, u]));

  return {
    newUsers30,
    newRequests30,
    completed30,
    byStatus: byStatus.map((s) => ({ status: s.status as string, count: s._count })),
    byCategory: byCategory.map((c) => ({
      name: catName.get(c.categoryId) ?? "?",
      count: c._count,
    })),
    byCity: byCity.map((c) => ({ city: c.city, count: c._count })),
    topProviders: topProviders.map((p) => ({
      id: p.user.id,
      name: p.user.fullName,
      isFounder: p.user.isFounder,
      completedJobs: p.completedJobs,
      ratingAvg: p.ratingAvg,
      ratingCount: p.ratingCount,
    })),
    referral: {
      totalReferred,
      founders,
      topInviters: topInvitersRaw.map((r) => ({
        name: inviterName.get(r.referredById!)?.fullName ?? "?",
        isFounder: inviterName.get(r.referredById!)?.isFounder ?? false,
        count: r._count,
      })),
    },
  };
}

// ─────────────────────────────────────────────
// DASHBOARD İSTATİSTİKLERİ
// ─────────────────────────────────────────────

export async function getAdminStats() {
  const [
    userCount,
    providerCount,
    openRequests,
    inEscrow,
    revenue,
    openDisputes,
    activePostings,
    unresolvedComplaints,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { roles: { has: UserRole.PROVIDER } } }),
    prisma.serviceRequest.count({ where: { status: ServiceRequestStatus.OPEN } }),
    prisma.payment.aggregate({
      where: { status: PaymentStatus.HELD },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: PaymentStatus.RELEASED },
      _sum: { platformFee: true },
    }),
    prisma.dispute.count({
      where: { status: { in: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW] } },
    }),
    prisma.jobPosting.count({ where: { status: JobPostingStatus.ACTIVE } }),
    prisma.complaint.count({ where: { isResolved: false } }),
  ]);

  const [openProblems, pendingVerifications, reportedReviews] = await Promise.all([
    prisma.problemReport.count({
      where: { status: { in: [ProblemStatus.OPEN, ProblemStatus.UNDER_REVIEW] } },
    }),
    prisma.verification.count({ where: { status: "PENDING" } }),
    prisma.review.count({ where: { reported: true } }),
  ]);

  return {
    userCount,
    providerCount,
    openRequests,
    escrowAmount: inEscrow._sum.amount ?? 0,
    revenue: revenue._sum.platformFee ?? 0,
    openDisputes,
    activePostings,
    unresolvedComplaints,
    openProblems,
    pendingVerifications,
    reportedReviews,
  };
}

// ─────────────────────────────────────────────
// SORUN BİLDİRİMLERİ (1. yıl — kayıt + admin aksiyonu)
// ─────────────────────────────────────────────

export async function listProblemReports() {
  return prisma.problemReport.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 200,
    include: {
      reporter: { select: { id: true, fullName: true, email: true } },
      serviceRequest: {
        select: { id: true, title: true, city: true, status: true },
      },
    },
  });
}

export async function updateProblemReport(
  id: string,
  status: ProblemStatus,
  adminNote?: string,
) {
  return prisma.problemReport.update({
    where: { id },
    data: { status, adminNote },
    select: { id: true, status: true },
  });
}

// ─────────────────────────────────────────────
// KULLANICI YÖNETİMİ
// ─────────────────────────────────────────────

export async function listUsers(q?: string) {
  return prisma.user.findMany({
    where: q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      roles: true,
      isActive: true,
      isBanned: true,
      emailVerified: true,
      phoneVerified: true,
      createdAt: true,
    },
  });
}

export async function setUserBan(userId: string, banned: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: { isBanned: banned },
    select: { id: true, isBanned: true },
  });
}

export async function setUserRoles(userId: string, roles: UserRole[]) {
  // En az bir rol kalsın
  const unique = Array.from(new Set(roles));
  if (unique.length === 0) throw new AdminError("En az bir rol seçili olmalı.");
  return prisma.user.update({
    where: { id: userId },
    data: { roles: unique },
    select: { id: true, roles: true },
  });
}

// ─────────────────────────────────────────────
// İTİRAZ (DISPUTE) ÇÖZÜMÜ — emanet iade/aktar
// ─────────────────────────────────────────────

export async function listDisputes() {
  return prisma.dispute.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 200,
    include: {
      serviceRequest: {
        select: {
          id: true,
          title: true,
          city: true,
          customer: { select: { id: true, fullName: true } },
          payment: {
            select: { id: true, amount: true, providerId: true, status: true },
          },
        },
      },
    },
  });
}

/**
 * İtirazı çözer.
 *  - "CUSTOMER" (müşteri lehine) → ödeme iade (REFUNDED), talep CANCELLED
 *  - "PROVIDER" (hizmet veren lehine) → ödeme aktar (RELEASED), talep COMPLETED
 */
export async function resolveDispute(
  disputeId: string,
  inFavorOf: "CUSTOMER" | "PROVIDER",
  note?: string,
) {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: { serviceRequest: { include: { payment: true } } },
  });
  if (!dispute) throw new AdminError("İtiraz bulunamadı.");
  if (
    dispute.status === DisputeStatus.RESOLVED_CUSTOMER ||
    dispute.status === DisputeStatus.RESOLVED_PROVIDER ||
    dispute.status === DisputeStatus.CLOSED
  )
    throw new AdminError("Bu itiraz zaten sonuçlanmış.");

  const payment = dispute.serviceRequest.payment;
  if (!payment) throw new AdminError("İlgili ödeme bulunamadı.");

  const requestId = dispute.serviceRequestId;
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    if (inFavorOf === "CUSTOMER") {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.REFUNDED, refundedAt: now },
      });
      await tx.serviceRequest.update({
        where: { id: requestId },
        data: { status: ServiceRequestStatus.CANCELLED },
      });
      await tx.dispute.update({
        where: { id: disputeId },
        data: {
          status: DisputeStatus.RESOLVED_CUSTOMER,
          resolutionNote: note,
          resolvedAt: now,
        },
      });
    } else {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.RELEASED, releasedAt: now },
      });
      await tx.serviceRequest.update({
        where: { id: requestId },
        data: { status: ServiceRequestStatus.COMPLETED },
      });
      await tx.providerProfile.updateMany({
        where: { userId: payment.providerId },
        data: { completedJobs: { increment: 1 } },
      });
      await tx.dispute.update({
        where: { id: disputeId },
        data: {
          status: DisputeStatus.RESOLVED_PROVIDER,
          resolutionNote: note,
          resolvedAt: now,
        },
      });
    }

    // Sistem mesajı (konuşma varsa)
    const convo = await tx.conversation.findUnique({
      where: { serviceRequestId: requestId },
      select: { id: true, participants: { select: { userId: true }, take: 1 } },
    });
    if (convo && convo.participants.length > 0) {
      await tx.message.create({
        data: {
          conversationId: convo.id,
          senderId: convo.participants[0].userId,
          isSystem: true,
          body:
            inFavorOf === "CUSTOMER"
              ? "İtiraz müşteri lehine sonuçlandı. Ödeme iade edildi."
              : "İtiraz hizmet veren lehine sonuçlandı. Ödeme aktarıldı.",
        },
      });
    }

    return { ok: true };
  });
}

// ─────────────────────────────────────────────
// LİSTELER (ödeme / talep / ilan / şikayet)
// ─────────────────────────────────────────────

export async function listPaymentsAdmin() {
  return prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      customer: { select: { fullName: true } },
      serviceRequest: { select: { id: true, title: true } },
    },
  });
}

export async function listServiceRequestsAdmin() {
  return prisma.serviceRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      customer: { select: { fullName: true } },
      category: { select: { name: true } },
      _count: { select: { offers: true } },
    },
  });
}

export async function listJobPostingsAdmin() {
  return prisma.jobPosting.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      company: { select: { name: true } },
      category: { select: { name: true } },
      _count: { select: { applications: true } },
    },
  });
}

export async function setJobPostingStatus(id: string, status: JobPostingStatus) {
  return prisma.jobPosting.update({
    where: { id },
    data: { status },
    select: { id: true, status: true },
  });
}

export async function listComplaints() {
  return prisma.complaint.findMany({
    orderBy: [{ isResolved: "asc" }, { createdAt: "desc" }],
    take: 200,
    include: { reporter: { select: { fullName: true } } },
  });
}

export async function resolveComplaint(id: string, resolved = true) {
  return prisma.complaint.update({
    where: { id },
    data: { isResolved: resolved },
    select: { id: true, isResolved: true },
  });
}

// ─────────────────────────────────────────────
// KATEGORİ YÖNETİMİ (hizmet + iş)
// ─────────────────────────────────────────────

function slugify(text: string): string {
  const map: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
    Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
  };
  return text
    .split("")
    .map((c) => map[c] ?? c)
    .join("")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function listServiceCategoriesAdmin() {
  return prisma.serviceCategory.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true, isActive: true, _count: { select: { children: true } } },
  });
}

export async function listJobCategoriesAdmin() {
  return prisma.jobCategory.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true, isActive: true, _count: { select: { postings: true } } },
  });
}

export async function createCategory(kind: "service" | "job", name: string) {
  const clean = name.trim();
  if (clean.length < 2) throw new AdminError("Kategori adı çok kısa.");
  const slug = slugify(clean) || `kat-${Date.now()}`;

  if (kind === "job") {
    const exists = await prisma.jobCategory.findUnique({ where: { slug } });
    if (exists) throw new AdminError("Bu kategori zaten var.");
    const max = await prisma.jobCategory.aggregate({ _max: { order: true } });
    return prisma.jobCategory.create({
      data: { name: clean, slug, order: (max._max.order ?? 0) + 1 },
    });
  }
  const exists = await prisma.serviceCategory.findUnique({ where: { slug } });
  if (exists) throw new AdminError("Bu kategori zaten var.");
  const max = await prisma.serviceCategory.aggregate({ _max: { order: true } });
  return prisma.serviceCategory.create({
    data: { name: clean, slug, order: (max._max.order ?? 0) + 1 },
  });
}

export async function toggleCategory(kind: "service" | "job", id: string, isActive: boolean) {
  if (kind === "job") {
    return prisma.jobCategory.update({ where: { id }, data: { isActive }, select: { id: true, isActive: true } });
  }
  return prisma.serviceCategory.update({ where: { id }, data: { isActive }, select: { id: true, isActive: true } });
}
