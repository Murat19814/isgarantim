import { z } from "zod";
import { mediaUrl } from "@/lib/validations/common";

export const serviceRequestSchema = z
  .object({
    categoryId: z.string().min(1, "Kategori seç."),
    subCategory: z.string().optional(),
    city: z.string().min(2, "Şehir seç."),
    district: z.string().optional(),
    neighborhood: z.string().max(120).optional(),
    title: z.string().min(5, "Başlık en az 5 karakter olmalı.").max(120),
    description: z.string().min(20, "Açıklama en az 20 karakter olmalı.").max(4000),
    budgetMin: z.number().int().positive().optional(),
    budgetMax: z.number().int().positive().optional(),
    preferredDate: z.string().datetime().optional().or(z.literal("").transform(() => undefined)),
    urgency: z.enum(["FLEXIBLE", "THIS_WEEK", "URGENT"]).default("FLEXIBLE"),
    locationType: z.enum(["ONSITE", "REMOTE", "BOTH"]).default("ONSITE"),
    contactPreference: z.enum(["PLATFORM", "PHONE", "BOTH"]).default("PLATFORM"),
    photos: z.array(mediaUrl).max(8, "En fazla 8 fotoğraf.").default([]),
    videos: z.array(mediaUrl).max(4, "En fazla 4 video.").default([]),
    voiceNote: mediaUrl.optional().or(z.literal("").transform(() => undefined)),
    invitedProviderId: z.string().optional(),
    isEmergency: z.boolean().default(false),
    isBulk: z.boolean().default(false),
    bulkQuantity: z.number().int().positive().max(100000).optional(),
    orgType: z.string().max(60).optional(),
    prefVerifiedProvider: z.boolean().default(false),
    prefWomanProvider: z.boolean().default(false),
    prefReviewedProvider: z.boolean().default(false),
    prefTeamProvider: z.boolean().default(false),
    onBehalf: z.boolean().default(false),
    onBehalfName: z.string().max(120).optional().or(z.literal("").transform(() => undefined)),
    onBehalfPhone: z.string().max(30).optional().or(z.literal("").transform(() => undefined)),
  })
  .refine(
    (d) => !d.budgetMin || !d.budgetMax || d.budgetMax >= d.budgetMin,
    { message: "Maksimum bütçe, minimumdan küçük olamaz.", path: ["budgetMax"] },
  );

export type ServiceRequestInput = z.infer<typeof serviceRequestSchema>;

export const offerSchema = z.object({
  price: z.number().int().positive("Geçerli bir fiyat gir."),
  estimatedDuration: z.string().min(1, "Tahmini süre gir.").max(60),
  message: z.string().max(1000).optional(),
  availability: z.string().max(120).optional(),
  materialsIncluded: z.boolean().optional(),
  onSiteInspection: z.boolean().optional(),
  voiceNote: mediaUrl.optional().or(z.literal("").transform(() => undefined)),
  videoUrl: mediaUrl.optional().or(z.literal("").transform(() => undefined)),
  portfolio: z.array(mediaUrl).max(6, "En fazla 6 görsel.").default([]),
});

export type OfferInput = z.infer<typeof offerSchema>;

export const agreementSchema = z.object({
  scope: z.string().min(10, "İş kapsamını biraz daha ayrıntılı yaz.").max(2000),
  price: z.number().int().positive("Geçerli bir fiyat gir."),
  materialsIncluded: z.boolean().default(false),
  startDate: z.string().datetime().optional().or(z.literal("").transform(() => undefined)),
  endDate: z.string().datetime().optional().or(z.literal("").transform(() => undefined)),
  cancellationTerms: z.string().max(1000).optional(),
  customerNote: z.string().max(1000).optional(),
  providerNote: z.string().max(1000).optional(),
});

export type AgreementInput = z.infer<typeof agreementSchema>;

/** "Beni arayın" — çağrı merkezi geri arama talebi. */
export const callbackSchema = z.object({
  name: z.string().min(2, "Adını yaz.").max(120),
  phone: z.string().min(7, "Geçerli bir telefon yaz.").max(30),
  topic: z.string().max(500).optional().or(z.literal("").transform(() => undefined)),
  city: z.string().max(80).optional().or(z.literal("").transform(() => undefined)),
});

export type CallbackInput = z.infer<typeof callbackSchema>;

export const purchaseCreditsSchema = z.object({
  amount: z
    .number()
    .int()
    .positive()
    .refine((n) => n % 100 === 0, "Kontör 100'ün katı olmalı."),
});

/** Hizmet veren "işi tamamladım" derken gönderdiği bilgi. */
export const deliverWorkSchema = z.object({
  note: z.string().max(2000).optional(),
  files: z.array(mediaUrl).max(10, "En fazla 10 dosya.").default([]),
});

export type DeliverWorkInput = z.infer<typeof deliverWorkSchema>;

/** İtiraz açma. */
export const disputeSchema = z.object({
  reason: z
    .string()
    .min(10, "İtiraz nedenini en az 10 karakter yaz.")
    .max(1000),
});

export type DisputeInput = z.infer<typeof disputeSchema>;

/** Platform içi mesaj. */
export const messageSchema = z
  .object({
    body: z.string().max(2000).optional(),
    attachments: z.array(mediaUrl).max(5, "En fazla 5 ek.").default([]),
  })
  .refine((d) => (d.body && d.body.trim().length > 0) || d.attachments.length > 0, {
    message: "Mesaj boş olamaz.",
    path: ["body"],
  });

export type MessageInput = z.infer<typeof messageSchema>;

/** Değerlendirme / puanlama (müşteri → hizmet veren). */
export const reviewSchema = z.object({
  rating: z
    .number({ invalid_type_error: "Puan seç." })
    .int()
    .min(1, "Puan 1-5 arası olmalı.")
    .max(5, "Puan 1-5 arası olmalı."),
  qualityRating: z.number().int().min(1).max(5).optional(),
  punctualityRating: z.number().int().min(1).max(5).optional(),
  communicationRating: z.number().int().min(1).max(5).optional(),
  priceRating: z.number().int().min(1).max(5).optional(),
  cleanlinessRating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000, "Yorum en fazla 1000 karakter.").optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

/** Hizmet verenin yoruma tek seferlik yanıtı. */
export const reviewReplySchema = z.object({
  reply: z.string().min(2, "Yanıt çok kısa.").max(1000),
});
export type ReviewReplyInput = z.infer<typeof reviewReplySchema>;

/** Yorum şikayeti. */
export const reviewReportSchema = z.object({
  reason: z.string().min(5, "Şikayet nedenini yaz.").max(500),
});
export type ReviewReportInput = z.infer<typeof reviewReportSchema>;

/** Çok kriterli değerlendirme ölçütleri (UI). */
export const REVIEW_CRITERIA = [
  { key: "qualityRating", label: "İş kalitesi" },
  { key: "punctualityRating", label: "Zamanında gelme" },
  { key: "communicationRating", label: "İletişim" },
  { key: "priceRating", label: "Fiyat uyumu" },
  { key: "cleanlinessRating", label: "Temizlik ve düzen" },
] as const;

/** Randevu oluşturma (müşteri, teklif seçtikten sonra). */
export const scheduleSchema = z.object({
  scheduledAt: z.string().datetime({ message: "Geçerli bir tarih/saat seç." }),
});
export type ScheduleInput = z.infer<typeof scheduleSchema>;

/** Sorun bildir (1. yıl — ödeme iadesi kararı yok, kayıt + admin aksiyonu). */
export const PROBLEM_TYPES = [
  "PROVIDER_NO_SHOW",
  "CUSTOMER_NO_SHOW",
  "PRICE_CHANGED",
  "INCOMPLETE_WORK",
  "DAMAGE",
  "MISCONDUCT",
  "FRAUD",
  "OTHER",
] as const;

export const problemReportSchema = z.object({
  type: z.enum(PROBLEM_TYPES),
  description: z.string().min(10, "Sorunu en az 10 karakter anlat.").max(2000),
  media: z.array(mediaUrl).max(8, "En fazla 8 dosya.").default([]),
});
export type ProblemReportInput = z.infer<typeof problemReportSchema>;

/** İş iptali. */
export const cancelSchema = z.object({
  reason: z.string().min(5, "İptal nedenini yaz.").max(1000),
});
export type CancelInput = z.infer<typeof cancelSchema>;
