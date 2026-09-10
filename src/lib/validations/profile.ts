import { z } from "zod";
import { mediaUrl } from "@/lib/validations/common";

export const providerProfileSchema = z.object({
  headline: z.string().max(120).optional().or(z.literal("")),
  bio: z.string().max(2000).optional().or(z.literal("")),
  city: z.string().max(60).optional().or(z.literal("")),
  district: z.string().max(60).optional().or(z.literal("")),
  experienceYears: z.number().int().min(0).max(70).optional(),
  availabilityNote: z.string().max(200).optional().or(z.literal("")),
  coverUrl: mediaUrl.optional().or(z.literal("")),
  serviceAreas: z.array(z.string().max(60)).max(20).default([]),
  portfolio: z.array(mediaUrl).max(20, "En fazla 20 portföy öğesi.").default([]),
  categoryIds: z.array(z.string()).max(12).default([]),
  workDays: z.array(z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"])).max(7).default([]),
  workStart: z.string().max(5).optional().or(z.literal("")),
  workEnd: z.string().max(5).optional().or(z.literal("")),
  sameDayAvailable: z.boolean().default(false),
});

export const WEEKDAYS: { key: string; label: string }[] = [
  { key: "MON", label: "Pzt" },
  { key: "TUE", label: "Sal" },
  { key: "WED", label: "Çar" },
  { key: "THU", label: "Per" },
  { key: "FRI", label: "Cum" },
  { key: "SAT", label: "Cmt" },
  { key: "SUN", label: "Paz" },
];

export type ProviderProfileInput = z.infer<typeof providerProfileSchema>;
