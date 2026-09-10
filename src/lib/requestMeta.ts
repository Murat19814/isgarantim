/** Hizmet talebi alan etiketleri (UI). Şema: RequestUrgency/Location/Contact. */
export const URGENCY_LABELS: Record<string, string> = {
  FLEXIBLE: "Esnek / planlı",
  THIS_WEEK: "Bu hafta",
  URGENT: "Acil (bugün/yarın)",
};

export const LOCATION_LABELS: Record<string, string> = {
  ONSITE: "Yerinde",
  REMOTE: "Uzaktan",
  BOTH: "Farketmez",
};

export const CONTACT_LABELS: Record<string, string> = {
  PLATFORM: "Uygulama içi mesaj",
  PHONE: "Telefon",
  BOTH: "İkisi de",
};
