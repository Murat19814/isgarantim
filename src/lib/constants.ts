/**
 * Uygulama genelinde kullanılan sabitler.
 * Not: Kategoriler nihai olarak admin panelinden yönetilecek (Faz 6),
 * burada başlangıç/tohum verisi olarak tutuluyor.
 */

export const APP_NAME = "İşKalkan";
export const APP_DOMAIN = "isgarantim.com";
export const APP_SLOGAN = "İşin de ödemen de güvende";

/** Teklif için harcanan varsayılan kontör bedeli. */
export const DEFAULT_OFFER_CREDIT_COST = 100;

/** Müşterinin işi onaylaması için verilen süre (gün). */
export const APPROVAL_WINDOW_DAYS = 3;

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

/** Çalışma şekli seçenekleri */
export const WORK_TYPES = ["Tam Zamanlı", "Yarı Zamanlı", "Sözleşmeli", "Uzaktan", "Stajyer"] as const;

export type UserRole = "customer" | "provider" | "jobseeker" | "employer" | "admin";

export const ROLE_LABELS: Record<UserRole, string> = {
  customer: "Hizmet Alan",
  provider: "Hizmet Veren",
  jobseeker: "İş Arayan",
  employer: "İşveren / Firma",
  admin: "Yönetici",
};
