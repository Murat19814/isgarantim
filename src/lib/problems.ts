/** Sorun türü etiketleri (UI). Şema: ProblemType enum. */
export const PROBLEM_LABELS: Record<string, string> = {
  PROVIDER_NO_SHOW: "Hizmet veren gelmedi",
  CUSTOMER_NO_SHOW: "Müşteri randevuya uymadı",
  PRICE_CHANGED: "Fiyat sonradan değiştirildi",
  INCOMPLETE_WORK: "İş eksik yapıldı",
  DAMAGE: "Hasar oluştu",
  MISCONDUCT: "Uygunsuz davranış",
  FRAUD: "Dolandırıcılık şüphesi",
  OTHER: "Diğer",
};

/** Sorun durumu etiketleri. */
export const PROBLEM_STATUS_LABELS: Record<string, string> = {
  OPEN: "Yeni",
  UNDER_REVIEW: "İnceleniyor",
  RESOLVED: "Çözüldü",
  CLOSED: "Kapatıldı",
};
