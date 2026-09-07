import { z } from "zod";

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
    photos: z.array(z.string().url()).max(8, "En fazla 8 fotoğraf.").default([]),
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
});

export type OfferInput = z.infer<typeof offerSchema>;

export const purchaseCreditsSchema = z.object({
  amount: z
    .number()
    .int()
    .positive()
    .refine((n) => n % 100 === 0, "Kontör 100'ün katı olmalı."),
});
