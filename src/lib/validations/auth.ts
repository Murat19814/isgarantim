import { z } from "zod";

export const ROLE_VALUES = ["CUSTOMER", "PROVIDER", "JOBSEEKER", "EMPLOYER"] as const;

/** TR telefon: +90 veya 0 ile başlayan, 10 haneli numara. */
const phoneRegex = /^(\+90|0)?5\d{9}$/;

/** Ortak güçlü şifre kuralı (kayıt + şifre değiştirme). */
export const passwordRule = z
  .string()
  .min(8, "Şifre en az 8 karakter olmalı.")
  .regex(/[a-z]/, "En az bir küçük harf içermeli.")
  .regex(/[A-Z]/, "En az bir büyük harf içermeli.")
  .regex(/[0-9]/, "En az bir rakam içermeli.");

export const registerSchema = z
  .object({
    fullName: z.string().min(3, "Ad soyad en az 3 karakter olmalı."),
    email: z.string().email("Geçerli bir e-posta gir."),
    phone: z
      .string()
      .regex(phoneRegex, "Geçerli bir cep telefonu gir (5XX XXX XX XX)."),
    password: passwordRule,
    passwordConfirm: z.string().min(1, "Şifreyi tekrar gir."),
    roles: z
      .array(z.enum(ROLE_VALUES))
      .min(1, "En az bir rol seç."),
    referralCode: z.string().trim().min(4).max(16).optional(),
  })
  .strict()
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Şifreler eşleşmiyor.",
    path: ["passwordConfirm"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

/** Giriş yapmış kullanıcının şifresini değiştirmesi. */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifreni gir."),
    newPassword: passwordRule,
    newPasswordConfirm: z.string().min(1, "Yeni şifreyi tekrar gir."),
  })
  .refine((d) => d.newPassword === d.newPasswordConfirm, {
    message: "Yeni şifreler eşleşmiyor.",
    path: ["newPasswordConfirm"],
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: "Yeni şifre mevcut şifreyle aynı olamaz.",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const loginSchema = z.object({
  identifier: z.string().min(3, "E-posta veya telefon gir."),
  password: z.string().min(1, "Şifre gir."),
});

export const verifySchema = z.object({
  channel: z.enum(["EMAIL", "PHONE"]),
  code: z.string().length(6, "Kod 6 haneli olmalı."),
});

/** Telefonu +90XXXXXXXXXX formatına normalize eder. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("90")) return "+" + digits;
  if (digits.startsWith("0")) return "+90" + digits.slice(1);
  if (digits.startsWith("5")) return "+90" + digits;
  return "+" + digits;
}
