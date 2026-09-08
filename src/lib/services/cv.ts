import { prisma } from "@/lib/prisma";
import type { CVInput } from "@/lib/validations/jobs";

/** Kullanıcının CV'sini tüm bölümleriyle getirir (yoksa null). */
export async function getCV(userId: string) {
  return prisma.cV.findUnique({
    where: { userId },
    include: {
      experiences: { orderBy: { startDate: "desc" } },
      educations: { orderBy: { startDate: "desc" } },
      skills: true,
      languages: true,
      certificates: true,
    },
  });
}

function toDate(v?: string | null): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * CV'yi tümüyle kaydeder (upsert + alt bölümleri sıfırlayıp yeniden yazar).
 * Basit ve tutarlı: istemci tüm CV'yi gönderir, sunucu tek atomik blokta günceller.
 */
export async function saveCV(userId: string, input: CVInput) {
  return prisma.$transaction(async (tx) => {
    const cv = await tx.cV.upsert({
      where: { userId },
      update: {
        title: input.title,
        summary: input.summary,
        phone: input.phone,
        email: input.email,
        city: input.city,
        birthYear: input.birthYear,
        photoUrl: input.photoUrl,
        isVisible: input.isVisible,
      },
      create: {
        userId,
        title: input.title,
        summary: input.summary,
        phone: input.phone,
        email: input.email,
        city: input.city,
        birthYear: input.birthYear,
        photoUrl: input.photoUrl,
        isVisible: input.isVisible,
      },
    });

    // Alt bölümleri sıfırla
    await tx.cVExperience.deleteMany({ where: { cvId: cv.id } });
    await tx.cVEducation.deleteMany({ where: { cvId: cv.id } });
    await tx.cVSkill.deleteMany({ where: { cvId: cv.id } });
    await tx.cVLanguage.deleteMany({ where: { cvId: cv.id } });
    await tx.cVCertificate.deleteMany({ where: { cvId: cv.id } });

    // Yeniden yaz
    if (input.experiences.length) {
      await tx.cVExperience.createMany({
        data: input.experiences.map((e) => ({
          cvId: cv.id,
          company: e.company,
          position: e.position,
          city: e.city,
          startDate: toDate(e.startDate) ?? new Date(),
          endDate: e.current ? null : toDate(e.endDate),
          current: e.current,
          desc: e.desc,
        })),
      });
    }
    if (input.educations.length) {
      await tx.cVEducation.createMany({
        data: input.educations.map((e) => ({
          cvId: cv.id,
          school: e.school,
          degree: e.degree,
          field: e.field,
          startDate: toDate(e.startDate),
          endDate: toDate(e.endDate),
        })),
      });
    }
    if (input.skills.length) {
      await tx.cVSkill.createMany({
        data: input.skills.map((s) => ({ cvId: cv.id, name: s.name, level: s.level })),
      });
    }
    if (input.languages.length) {
      await tx.cVLanguage.createMany({
        data: input.languages.map((l) => ({ cvId: cv.id, name: l.name, level: l.level })),
      });
    }
    if (input.certificates.length) {
      await tx.cVCertificate.createMany({
        data: input.certificates.map((c) => ({
          cvId: cv.id,
          name: c.name,
          issuer: c.issuer,
          issuedAt: toDate(c.issuedAt),
        })),
      });
    }

    return cv;
  });
}

/** CV görünürlüğünü değiştirir (firmalara açık/kapalı). */
export async function setCVVisibility(userId: string, isVisible: boolean) {
  return prisma.cV.update({
    where: { userId },
    data: { isVisible },
  });
}
