import { z } from "zod";

/**
 * Medya bağlantısı doğrulayıcı.
 * Kabul eder:
 *  - Tam URL (https://res.cloudinary.com/...)
 *  - Site-içi yüklenen dosya yolu (/uploads/....)
 */
export const mediaUrl = z
  .string()
  .refine(
    (v) => /^https?:\/\//.test(v) || v.startsWith("/"),
    "Geçerli bir bağlantı ya da yüklenmiş dosya olmalı.",
  );

/** Opsiyonel medya bağlantısı; boş string → undefined. */
export const optionalMediaUrl = mediaUrl
  .optional()
  .or(z.literal("").transform(() => undefined));
