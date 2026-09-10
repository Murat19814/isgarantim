import { VerificationType, VerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/services/notifications";

export class VerificationError extends Error {}

/** Kullanıcının başvurabileceği (belge yüklemeli) doğrulama türleri. */
export const SUBMITTABLE_TYPES: VerificationType[] = [
  VerificationType.IDENTITY,
  VerificationType.ADDRESS,
  VerificationType.PROFESSIONAL,
  VerificationType.COMPANY,
  VerificationType.REFERENCE,
];

/**
 * Kullanıcı bir doğrulama başvurusu yükler (belge admin onayına düşer).
 * Belge URL'i GİZLİDİR; herkese açık gösterilmez, yalnız admin görür.
 */
export async function submitVerification(
  userId: string,
  type: VerificationType,
  documentUrl?: string,
  note?: string,
) {
  if (!SUBMITTABLE_TYPES.includes(type))
    throw new VerificationError("Bu doğrulama türü başvuruya kapalı.");

  return prisma.verification.upsert({
    where: { userId_type: { userId, type } },
    update: {
      status: VerificationStatus.PENDING,
      documentUrl,
      note,
      adminNote: null,
      reviewedById: null,
      reviewedAt: null,
    },
    create: { userId, type, documentUrl, note, status: VerificationStatus.PENDING },
    select: { id: true, type: true, status: true },
  });
}

/**
 * Kullanıcının rozet durumları.
 * PHONE/EMAIL User'dan türetilir; diğerleri onaylı Verification kayıtlarından.
 * Belge içeriği ASLA döndürülmez — yalnız durum.
 */
export async function getUserBadges(userId: string) {
  const [user, verifications] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true, phoneVerified: true },
    }),
    prisma.verification.findMany({
      where: { userId },
      select: { type: true, status: true },
    }),
  ]);

  const map = new Map(verifications.map((v) => [v.type, v.status]));
  const isApproved = (t: VerificationType) => map.get(t) === VerificationStatus.APPROVED;

  return {
    PHONE: !!user?.phoneVerified,
    EMAIL: !!user?.emailVerified,
    IDENTITY: isApproved(VerificationType.IDENTITY),
    ADDRESS: isApproved(VerificationType.ADDRESS),
    PROFESSIONAL: isApproved(VerificationType.PROFESSIONAL),
    COMPANY: isApproved(VerificationType.COMPANY),
    REFERENCE: isApproved(VerificationType.REFERENCE),
  } as Record<string, boolean>;
}

/** Kullanıcının kendi başvuru durumları (belge URL'siz). */
export async function getMyVerifications(userId: string) {
  return prisma.verification.findMany({
    where: { userId },
    select: { type: true, status: true, adminNote: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
}

// ── ADMIN ──────────────────────────────────────

export async function listPendingVerifications() {
  return prisma.verification.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 200,
    include: { user: { select: { id: true, fullName: true, email: true } } },
  });
}

export async function reviewVerification(
  id: string,
  adminId: string,
  status: VerificationStatus,
  adminNote?: string,
) {
  const v = await prisma.verification.update({
    where: { id },
    data: { status, adminNote, reviewedById: adminId, reviewedAt: new Date() },
    select: { id: true, userId: true, type: true, status: true },
  });

  // ProviderProfile eski bayrakları da senkron tut (geriye uyumluluk)
  if (v.type === VerificationType.IDENTITY) {
    await prisma.providerProfile.updateMany({
      where: { userId: v.userId },
      data: { identityVerified: status === VerificationStatus.APPROVED },
    });
  }
  if (v.type === VerificationType.PROFESSIONAL) {
    await prisma.providerProfile.updateMany({
      where: { userId: v.userId },
      data: { skillVerified: status === VerificationStatus.APPROVED },
    });
  }

  await notify(v.userId, {
    type: "VERIFICATION_REVIEWED",
    title:
      status === VerificationStatus.APPROVED
        ? "Doğrulaman onaylandı ✓"
        : "Doğrulama başvurun güncellendi",
    body:
      status === VerificationStatus.APPROVED
        ? "Bir doğrulama rozetin aktif edildi."
        : "Doğrulama başvurun incelendi. Panelden durumu görebilirsin.",
    link: "/panel/dogrulama",
  });

  return v;
}
