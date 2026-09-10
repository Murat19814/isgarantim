import { z } from "zod";
import { mediaUrl } from "@/lib/validations/common";

export const serviceRequestSchema = z
  .object({
    categoryId: z.string().min(1, "Kategori seç."),
    subCategory: z.string().optional(),
    city: z.string().min(2, "Şehir seç."),
    district: z.string().optional(),
    title: z.string().min(5, "Başlık en az 5 karakter olmalı.").max(120),
    description: z.string().min(20, "Açıklama en az 20 karakter olmalı.").max(4000),
    budgetMin: z.number().int().positive().optional(),
    budgetMax: z.number().int().positive().optional(),
    preferredDate: z.string().datetime().optional().or(z.literal("").transform(() => undefined)),
    photos: z.array(mediaUrl).max(8, "En fazla 8 fotoğraf.").default([]),
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
});

export type OfferInput = z.infer<typeof offerSchema>;

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
  comment: z.string().max(1000, "Yorum en fazla 1000 karakter.").optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
