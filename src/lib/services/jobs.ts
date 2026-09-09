import {
  JobPostingStatus,
  JobApplicationStatus,
  WorkType,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { JOB_PLANS } from "@/lib/constants";
import { notify } from "@/lib/services/notifications";
import type {
  JobPostingInput,
  jobFilterSchema,
  candidateFilterSchema,
} from "@/lib/validations/jobs";
import type { z } from "zod";

export class JobError extends Error {}

/** Aktif iş ilanı kategorileri (ilan formu + filtreler için). */
export async function listJobCategories() {
  return prisma.jobCategory.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true },
  });
}

// ─────────────────────────────────────────────
// İLAN OLUŞTURMA (ilan hakkı tüketir)
// ─────────────────────────────────────────────

export async function createJobPosting(userId: string, input: JobPostingInput) {
  const company = await prisma.company.findFirst({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" },
  });
  if (!company) throw new JobError("Önce firma profilini oluşturmalısın.");

  const now = new Date();
  const subs = await prisma.companySubscription.findMany({
    where: { companyId: company.id, isActive: true },
    orderBy: { createdAt: "asc" },
  });
  const usable = subs.find(
    (s) => s.postQuota > 0 && (!s.expiresAt || s.expiresAt > now),
  );
  if (!usable)
    throw new JobError("İlan yayınlamak için ilan hakkın yok. Bir plan satın al.");

  const planDays =
    JOB_PLANS.find((p) => p.id === usable.plan)?.days ?? 30;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + planDays);

  return prisma.$transaction(async (tx) => {
    await tx.companySubscription.update({
      where: { id: usable.id },
      data: { postQuota: { decrement: 1 } },
    });

    const posting = await tx.jobPosting.create({
      data: {
        companyId: company.id,
        categoryId: input.categoryId,
        title: input.title,
        description: input.description,
        city: input.city,
        district: input.district,
        workType: input.workType as WorkType,
        salaryMin: input.salaryMin,
        salaryMax: input.salaryMax,
        experienceMin: input.experienceMin,
        educationLevel: input.educationLevel,
        languages: input.languages,
        skills: input.skills,
        status: JobPostingStatus.ACTIVE,
        publishedAt: now,
        expiresAt,
      },
    });
    return posting;
  });
}

// ─────────────────────────────────────────────
// İLAN LİSTELEME (herkese açık) + DETAY
// ─────────────────────────────────────────────

export async function listJobPostings(
  filter: z.infer<typeof jobFilterSchema>,
) {
  const now = new Date();
  return prisma.jobPosting.findMany({
    where: {
      status: JobPostingStatus.ACTIVE,
      ...(filter.city ? { city: filter.city } : {}),
      ...(filter.categoryId ? { categoryId: filter.categoryId } : {}),
      ...(filter.workType ? { workType: filter.workType as WorkType } : {}),
      AND: [
        { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
        ...(filter.q
          ? [
              {
                OR: [
                  { title: { contains: filter.q, mode: "insensitive" as const } },
                  { description: { contains: filter.q, mode: "insensitive" as const } },
                ],
              },
            ]
          : []),
      ],
    },
    orderBy: { publishedAt: "desc" },
    include: {
      company: { select: { name: true, logoUrl: true, city: true, verified: true } },
      category: { select: { name: true } },
      _count: { select: { applications: true } },
    },
  });
}

export async function getJobPosting(id: string) {
  return prisma.jobPosting.findUnique({
    where: { id },
    include: {
      company: { select: { id: true, name: true, logoUrl: true, city: true, about: true, website: true, verified: true } },
      category: { select: { name: true } },
      _count: { select: { applications: true } },
    },
  });
}

/** İş verenin kendi ilanları. */
export async function listCompanyPostings(companyId: string) {
  return prisma.jobPosting.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      _count: { select: { applications: true } },
    },
  });
}

// ─────────────────────────────────────────────
// BAŞVURU
// ─────────────────────────────────────────────

export async function applyToJob(
  userId: string,
  postingId: string,
  coverLetter?: string,
) {
  const posting = await prisma.jobPosting.findUnique({
    where: { id: postingId },
    select: { id: true, status: true, title: true, company: { select: { ownerId: true } } },
  });
  if (!posting) throw new JobError("İlan bulunamadı.");
  if (posting.status !== JobPostingStatus.ACTIVE)
    throw new JobError("Bu ilan artık başvuru kabul etmiyor.");
  if (posting.company.ownerId === userId)
    throw new JobError("Kendi ilanına başvuramazsın.");

  const existing = await prisma.jobApplication.findUnique({
    where: { jobPostingId_applicantId: { jobPostingId: postingId, applicantId: userId } },
  });
  if (existing) throw new JobError("Bu ilana zaten başvurdun.");

  const cv = await prisma.cV.findUnique({ where: { userId }, select: { id: true } });

  const application = await prisma.jobApplication.create({
    data: {
      jobPostingId: postingId,
      applicantId: userId,
      cvId: cv?.id,
      coverLetter,
      status: JobApplicationStatus.APPLIED,
    },
  });

  // İşverene bildirim
  await notify(posting.company.ownerId, {
    type: "JOB_APPLICATION",
    title: "Yeni başvuru aldın",
    body: `"${posting.title}" ilanına yeni bir başvuru geldi.`,
    link: `/panel/isveren/ilan/${postingId}`,
  });

  return application;
}

/** Kullanıcının belirli ilana başvurusu (yoksa null). */
export async function getApplicationFor(userId: string, postingId: string) {
  return prisma.jobApplication.findUnique({
    where: { jobPostingId_applicantId: { jobPostingId: postingId, applicantId: userId } },
    select: { id: true, status: true },
  });
}

/** İş arayanın başvuruları. */
export async function listMyApplications(userId: string) {
  return prisma.jobApplication.findMany({
    where: { applicantId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      jobPosting: {
        select: {
          id: true,
          title: true,
          city: true,
          company: { select: { name: true } },
        },
      },
    },
  });
}

/** İş arayanın aldığı görüşme davetleri. */
export async function listMyInvitations(userId: string) {
  return prisma.interviewInvitation.findMany({
    where: { candidateId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      jobPosting: {
        select: {
          id: true,
          title: true,
          company: { select: { name: true } },
        },
      },
    },
  });
}

/** İlana gelen başvurular (yalnızca ilan sahibi görebilir). */
export async function listApplicationsForPosting(
  userId: string,
  postingId: string,
) {
  const posting = await prisma.jobPosting.findUnique({
    where: { id: postingId },
    select: { id: true, company: { select: { ownerId: true } } },
  });
  if (!posting) throw new JobError("İlan bulunamadı.");
  if (posting.company.ownerId !== userId)
    throw new JobError("Bu ilanın başvurularını göremezsin.");

  return prisma.jobApplication.findMany({
    where: { jobPostingId: postingId },
    orderBy: { createdAt: "desc" },
    include: {
      applicant: { select: { id: true, fullName: true } },
      cv: {
        select: {
          id: true,
          title: true,
          summary: true,
          city: true,
          isVisible: true,
          skills: { select: { name: true } },
          languages: { select: { name: true, level: true } },
        },
      },
    },
  });
}

export async function updateApplicationStatus(
  userId: string,
  applicationId: string,
  status: JobApplicationStatus,
) {
  const app = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      applicantId: true,
      jobPosting: {
        select: { title: true, company: { select: { ownerId: true } } },
      },
    },
  });
  if (!app) throw new JobError("Başvuru bulunamadı.");
  if (app.jobPosting.company.ownerId !== userId)
    throw new JobError("Bu başvuruyu düzenleyemezsin.");

  const updated = await prisma.jobApplication.update({
    where: { id: applicationId },
    data: { status },
  });

  // Adaya bildirim
  const statusLabel: Record<string, string> = {
    APPLIED: "başvuruldu",
    REVIEWED: "incelendi",
    INVITED: "görüşmeye davet edildi",
    REJECTED: "olumsuz sonuçlandı",
    HIRED: "işe alındı",
  };
  await notify(app.applicantId, {
    type: "APPLICATION_STATUS",
    title: "Başvuru durumun güncellendi",
    body: `"${app.jobPosting.title}" başvurun: ${statusLabel[status] ?? status}.`,
    link: `/panel/is-ara`,
  });

  return updated;
}

// ─────────────────────────────────────────────
// ADAY FİLTRELEME (yalnızca görünür CV'ler)
// ─────────────────────────────────────────────

function totalExperienceYears(
  experiences: { startDate: Date; endDate: Date | null; current: boolean }[],
): number {
  let months = 0;
  for (const e of experiences) {
    const end = e.current || !e.endDate ? new Date() : e.endDate;
    months += Math.max(
      0,
      (end.getFullYear() - e.startDate.getFullYear()) * 12 +
        (end.getMonth() - e.startDate.getMonth()),
    );
  }
  return Math.round(months / 12);
}

export async function filterCandidates(
  filter: z.infer<typeof candidateFilterSchema>,
) {
  const cvs = await prisma.cV.findMany({
    where: {
      isVisible: true,
      ...(filter.city ? { city: filter.city } : {}),
      ...(filter.q
        ? {
            OR: [
              { title: { contains: filter.q, mode: "insensitive" as const } },
              { summary: { contains: filter.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    include: {
      user: { select: { id: true, fullName: true } },
      experiences: { select: { startDate: true, endDate: true, current: true, position: true } },
      educations: { select: { degree: true, field: true, school: true } },
      skills: { select: { name: true, level: true } },
      languages: { select: { name: true, level: true } },
    },
    take: 100,
  });

  return cvs
    .map((cv) => ({ cv, years: totalExperienceYears(cv.experiences) }))
    .filter(({ cv, years }) => {
      if (filter.minExperience && years < filter.minExperience) return false;
      if (
        filter.skill &&
        !cv.skills.some((s) =>
          s.name.toLowerCase().includes(filter.skill!.toLowerCase()),
        )
      )
        return false;
      if (
        filter.language &&
        !cv.languages.some((l) =>
          l.name.toLowerCase().includes(filter.language!.toLowerCase()),
        )
      )
        return false;
      if (
        filter.educationLevel &&
        !cv.educations.some((e) =>
          (e.degree ?? "")
            .toLowerCase()
            .includes(filter.educationLevel!.toLowerCase()),
        )
      )
        return false;
      return true;
    })
    .map(({ cv, years }) => ({
      cvId: cv.id,
      userId: cv.user.id,
      fullName: cv.user.fullName,
      title: cv.title,
      summary: cv.summary,
      city: cv.city,
      years,
      skills: cv.skills.map((s) => s.name),
      languages: cv.languages.map((l) => `${l.name} (${l.level})`),
    }));
}

// ─────────────────────────────────────────────
// GÖRÜŞME DAVETİ
// ─────────────────────────────────────────────

export async function inviteCandidate(
  userId: string,
  postingId: string,
  candidateId: string,
  message?: string,
  proposedAt?: string,
) {
  const posting = await prisma.jobPosting.findUnique({
    where: { id: postingId },
    select: { id: true, title: true, company: { select: { ownerId: true } } },
  });
  if (!posting) throw new JobError("İlan bulunamadı.");
  if (posting.company.ownerId !== userId)
    throw new JobError("Bu ilana davet gönderemezsin.");

  const invitation = await prisma.$transaction(async (tx) => {
    const created = await tx.interviewInvitation.create({
      data: {
        jobPostingId: postingId,
        candidateId,
        message,
        proposedAt: proposedAt ? new Date(proposedAt) : null,
      },
    });

    // Başvurusu varsa durumu INVITED yap
    await tx.jobApplication.updateMany({
      where: { jobPostingId: postingId, applicantId: candidateId },
      data: { status: JobApplicationStatus.INVITED },
    });

    return created;
  });

  // Adaya bildirim
  await notify(candidateId, {
    type: "INTERVIEW_INVITE",
    title: "Görüşme davetin var 📩",
    body: `"${posting.title}" ilanı için görüşmeye davet edildin.`,
    link: `/panel/is-ara`,
  });

  return invitation;
}
