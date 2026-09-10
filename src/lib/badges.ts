/** Doğrulama rozeti meta bilgisi (etiket + kısa açıklama). Şema: VerificationType. */
export const BADGE_LABELS: Record<string, string> = {
  PHONE: "Telefon doğrulandı",
  EMAIL: "E-posta doğrulandı",
  IDENTITY: "Kimlik doğrulandı",
  ADDRESS: "Adres doğrulandı",
  PROFESSIONAL: "Mesleki belge doğrulandı",
  COMPANY: "Firma doğrulandı",
  REFERENCE: "Referans doğrulandı",
};

/** Kullanıcının başvurabileceği (belge yüklemeli) türler + açıklama. */
export const SUBMITTABLE_BADGES: { type: string; label: string; hint: string }[] = [
  { type: "IDENTITY", label: "Kimlik", hint: "Nüfus cüzdanı / ehliyet fotoğrafı (yalnız admin görür)" },
  { type: "ADDRESS", label: "Adres", hint: "İkametgah veya fatura (yalnız admin görür)" },
  { type: "PROFESSIONAL", label: "Mesleki belge", hint: "Ustalık/yeterlilik belgesi (yalnız admin görür)" },
  { type: "COMPANY", label: "Firma", hint: "Vergi levhası / ticaret sicil (yalnız admin görür)" },
  { type: "REFERENCE", label: "Referans", hint: "Referans mektubu / iletişim (yalnız admin görür)" },
];

export const VERIFICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: "İnceleniyor",
  APPROVED: "Onaylandı",
  REJECTED: "Reddedildi",
};
