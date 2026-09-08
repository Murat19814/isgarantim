import { z } from "zod";
import { WORK_TYPE_VALUES } from "@/lib/constants";
import { optionalMediaUrl } from "@/lib/validations/common";

// ─────────────────────────────────────────────
// CV / ÖZGEÇMİŞ
// ─────────────────────────────────────────────

const dateish = z
  .string()
  .optional()
  .or(z.literal("").transform(() => undefined));

export const cvExperienceSchema = z.object({
  company: z.string().min(1, "Firma adı gerekli.").max(120),
  position: z.string().min(1, "Pozisyon gerekli.").max(120),
  city: z.string().max(60).optional(),
  startDate: z.string().min(1, "Başlangıç tarihi gerekli."),
  endDate: dateish,
  current: z.boolean().default(false),
  desc: z.string().max(1000).optional(),
});

export const cvEducationSchema = z.object({
  school: z.string().min(1, "Okul adı gerekli.").max(120),
  degree: z.string().max(120).optional(),
  field: z.string().max(120).optional(),
  startDate: dateish,
  endDate: dateish,
});

export const cvSkillSchema = z.object({
  name: z.string().min(1).max(60),
  level: z.number().int().min(1).max(5).default(3),
});

export const cvLanguageSchema = z.object({
  name: z.string().min(1).max(60),
  level: z.string().min(1).max(20),
});

export const cvCertificateSchema = z.object({
  name: z.string().min(1).max(120),
  issuer: z.string().max(120).optional(),
  issuedAt: dateish,
});

export const cvSchema = z.object({
  title: z.string().max(120).optional(),
  summary: z.string().max(2000).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email("Geçerli e-posta gir.").optional().or(z.literal("").transform(() => undefined)),
  city: z.string().max(60).optional(),
  birthYear: z
    .number()
    .int()
    .min(1940)
    .max(new Date().getFullYear())
    .optional(),
  photoUrl: optionalMediaUrl,
  isVisible: z.boolean().default(false),
  experiences: z.array(cvExperienceSchema).max(20).default([]),
  educations: z.array(cvEducationSchema).max(20).default([]),
  skills: z.array(cvSkillSchema).max(40).default([]),
  languages: z.array(cvLanguageSchema).max(20).default([]),
  certificates: z.array(cvCertificateSchema).max(20).default([]),
});

export type CVInput = z.infer<typeof cvSchema>;

// ─────────────────────────────────────────────
// FİRMA
// ─────────────────────────────────────────────

export const companySchema = z.object({
  name: z.string().min(2, "Firma adı gerekli.").max(160),
  taxNumber: z.string().max(30).optional(),
  logoUrl: optionalMediaUrl,
  website: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  about: z.string().max(2000).optional(),
  city: z.string().max(60).optional(),
});

export type CompanyInput = z.infer<typeof companySchema>;

export const purchasePlanSchema = z.object({
  planId: z.enum(["SINGLE", "PACKAGE", "MONTHLY"]),
});

// ─────────────────────────────────────────────
// İŞ İLANI
// ─────────────────────────────────────────────

export const jobPostingSchema = z
  .object({
    categoryId: z.string().min(1, "Kategori seç."),
    title: z.string().min(5, "Başlık en az 5 karakter.").max(160),
    description: z.string().min(20, "Açıklama en az 20 karakter.").max(6000),
    city: z.string().min(2, "Şehir seç."),
    district: z.string().max(60).optional(),
    workType: z.enum(WORK_TYPE_VALUES),
    salaryMin: z.number().int().positive().optional(),
    salaryMax: z.number().int().positive().optional(),
    experienceMin: z.number().int().min(0).max(50).optional(),
    educationLevel: z.string().max(60).optional(),
    languages: z.array(z.string().max(60)).max(10).default([]),
    skills: z.array(z.string().max(60)).max(20).default([]),
  })
  .refine(
    (d) => !d.salaryMin || !d.salaryMax || d.salaryMax >= d.salaryMin,
    { message: "Maksimum maaş minimumdan küçük olamaz.", path: ["salaryMax"] },
  );

export type JobPostingInput = z.infer<typeof jobPostingSchema>;

// ─────────────────────────────────────────────
// BAŞVURU / DAVET / ADAY FİLTRE
// ─────────────────────────────────────────────

export const jobApplicationSchema = z.object({
  coverLetter: z.string().max(2000).optional(),
});

export const applicationStatusSchema = z.object({
  status: z.enum(["APPLIED", "REVIEWED", "SHORTLISTED", "INVITED", "REJECTED", "HIRED"]),
});

export const interviewInvitationSchema = z.object({
  candidateId: z.string().min(1),
  message: z.string().max(1000).optional(),
  proposedAt: z.string().optional().or(z.literal("").transform(() => undefined)),
});

export const candidateFilterSchema = z.object({
  q: z.string().max(120).optional(),
  city: z.string().max(60).optional(),
  minExperience: z.coerce.number().int().min(0).max(50).optional(),
  educationLevel: z.string().max(60).optional(),
  language: z.string().max(60).optional(),
  skill: z.string().max(60).optional(),
});

export const jobFilterSchema = z.object({
  q: z.string().max(120).optional(),
  city: z.string().max(60).optional(),
  categoryId: z.string().optional(),
  workType: z.enum(WORK_TYPE_VALUES).optional(),
});
