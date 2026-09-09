/**
 * Uygulama genelinde kullanılan sabitler.
 * Not: Kategoriler nihai olarak admin panelinden yönetilecek (Faz 6),
 * burada başlangıç/tohum verisi olarak tutuluyor.
 */

export const APP_NAME = "İşKalkan";
export const APP_DOMAIN = "isgarantim.com";
export const APP_SLOGAN = "İşin de ödemen de güvende";

/**
 * Yasal/kurumsal bilgiler — tek kaynak.
 * ⚠️ Köşeli parantezli alanları gerçek firma bilgilerinle DOLDUR.
 * (Ticari ünvan, MERSİS, adres, vergi dairesi vb. yasal metinlerde zorunludur.)
 */
export const LEGAL = {
  companyName: "[Firma Ticari Ünvanı]",
  tradeName: "İşKalkan",
  address: "[Açık Adres, İlçe/İl]",
  mersis: "[MERSİS No]",
  taxOffice: "[Vergi Dairesi]",
  taxNumber: "[Vergi/TC Kimlik No]",
  kepAddress: "[KEP Adresi]",
  phone: "[Telefon]",
  supportEmail: "destek@isgarantim.com",
  kvkkEmail: "kvkk@isgarantim.com",
  lastUpdated: "10.09.2026",
} as const;

/** Teklif için harcanan varsayılan kontör bedeli. */
export const DEFAULT_OFFER_CREDIT_COST = 100;

/** Müşterinin işi onaylaması için verilen süre (gün). */
export const APPROVAL_WINDOW_DAYS = 3;

/** Platform komisyon oranı — emanetteki tutardan kesilir (hizmet verene kalan = tutar - komisyon). */
export const PLATFORM_COMMISSION_RATE = 0.1;

export const CITIES = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Adana",
  "Konya",
  "Gaziantep",
  "Kocaeli",
  "Kayseri",
  "Mersin",
  "Samsun",
  "Eskişehir",
  "Trabzon",
  "Diyarbakır",
] as const;

/** Hizmet kategorileri (Hizmet Al / Hizmet Ver tarafı) */
export const SERVICE_CATEGORIES = [
  { slug: "tadilat-tamir", name: "Tadilat & Tamir", icon: "Hammer", sub: ["Boya Badana", "Fayans", "Alçı & Sıva", "Ustabaşı"] },
  { slug: "temizlik", name: "Temizlik", icon: "Sparkles", sub: ["Ev Temizliği", "Ofis Temizliği", "İnşaat Sonrası", "Koltuk Yıkama"] },
  { slug: "tesisat", name: "Su & Isıtma Tesisatı", icon: "Wrench", sub: ["Su Tesisatı", "Kombi Servisi", "Petek Temizliği"] },
  { slug: "elektrik", name: "Elektrik", icon: "Zap", sub: ["Elektrik Arıza", "Aydınlatma", "Pano & Tesisat"] },
  { slug: "nakliyat", name: "Nakliyat & Taşıma", icon: "Truck", sub: ["Evden Eve", "Ofis Taşıma", "Şehirlerarası"] },
  { slug: "mobilya", name: "Mobilya", icon: "Sofa", sub: ["Montaj", "Tamir", "Döşeme"] },
  { slug: "bahce", name: "Bahçe & Peyzaj", icon: "Trees", sub: ["Çim Bakımı", "Sulama", "Peyzaj"] },
  { slug: "beyaz-esya", name: "Beyaz Eşya Servisi", icon: "Refrigerator", sub: ["Buzdolabı", "Çamaşır Makinesi", "Bulaşık Makinesi"] },
  { slug: "ozel-ders", name: "Özel Ders", icon: "GraduationCap", sub: ["Matematik", "Yabancı Dil", "Müzik"] },
  { slug: "guzellik", name: "Güzellik & Bakım", icon: "Scissors", sub: ["Kuaför", "Cilt Bakımı", "Masaj"] },
  { slug: "bilisim", name: "Bilişim & Teknik", icon: "Laptop", sub: ["Bilgisayar Tamir", "Ağ Kurulumu", "Yazılım"] },
  { slug: "organizasyon", name: "Organizasyon", icon: "PartyPopper", sub: ["Düğün", "Doğum Günü", "Catering"] },
] as const;

/** İş ilanı kategorileri (İş Ara / İş İlanı Ver tarafı) — hizmetten AYRI */
export const JOB_CATEGORIES = [
  { slug: "satis-pazarlama", name: "Satış & Pazarlama", icon: "TrendingUp" },
  { slug: "bilisim-yazilim", name: "Bilişim & Yazılım", icon: "Code" },
  { slug: "muhasebe-finans", name: "Muhasebe & Finans", icon: "Calculator" },
  { slug: "uretim-imalat", name: "Üretim & İmalat", icon: "Factory" },
  { slug: "lojistik-tasimacilik", name: "Lojistik & Taşımacılık", icon: "Truck" },
  { slug: "saglik", name: "Sağlık", icon: "HeartPulse" },
  { slug: "egitim", name: "Eğitim", icon: "GraduationCap" },
  { slug: "insaat", name: "İnşaat", icon: "HardHat" },
  { slug: "turizm-hizmet", name: "Turizm & Hizmet", icon: "Utensils" },
  { slug: "cagri-merkezi", name: "Çağrı Merkezi", icon: "Headset" },
] as const;

/** Çalışma şekli seçenekleri (UI etiketleri) */
export const WORK_TYPES = ["Tam Zamanlı", "Yarı Zamanlı", "Sözleşmeli", "Uzaktan", "Stajyer"] as const;

/** WorkType enum ↔ Türkçe etiket */
export const WORK_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Tam Zamanlı",
  PART_TIME: "Yarı Zamanlı",
  CONTRACT: "Sözleşmeli",
  REMOTE: "Uzaktan",
  INTERN: "Stajyer",
};

export const WORK_TYPE_VALUES = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "REMOTE",
  "INTERN",
] as const;

/** Eğitim seviyeleri */
export const EDUCATION_LEVELS = [
  "İlköğretim",
  "Lise",
  "Ön Lisans",
  "Lisans",
  "Yüksek Lisans",
  "Doktora",
] as const;

/** Yabancı dil seviyeleri */
export const LANGUAGE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2", "Anadil"] as const;

/**
 * İş ilanı planları (mock ödeme ile satın alınır).
 * quota: yayınlanabilecek ilan sayısı, days: ilan aktif kalma süresi.
 */
export const JOB_PLANS = [
  { id: "SINGLE", name: "Tek İlan", quota: 1, price: 750, days: 30, desc: "Tek bir iş ilanı, 30 gün yayında." },
  { id: "PACKAGE", name: "5 İlan Paketi", quota: 5, price: 3000, days: 60, desc: "5 ilan hakkı, her biri 60 gün yayında." },
  { id: "MONTHLY", name: "Aylık Abonelik", quota: 9999, price: 5000, days: 30, desc: "Sınırsız ilan, 30 gün boyunca." },
] as const;

export type JobPlanId = (typeof JOB_PLANS)[number]["id"];

export type UserRole = "customer" | "provider" | "jobseeker" | "employer" | "admin";

export const ROLE_LABELS: Record<UserRole, string> = {
  customer: "Hizmet Alan",
  provider: "Hizmet Veren",
  jobseeker: "İş Arayan",
  employer: "İşveren / Firma",
  admin: "Yönetici",
};
