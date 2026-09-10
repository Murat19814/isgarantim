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
});

export type ProviderProfileInput = z.infer<typeof providerProfileSchema>;
