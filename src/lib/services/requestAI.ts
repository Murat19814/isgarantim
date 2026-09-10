import { prisma } from "@/lib/prisma";
import { CITIES } from "@/lib/constants";
import { aiEnabled, chatJSON, visionJSON } from "@/lib/ai";

export type PhotoDetection = {
  categoryId?: string;
  categoryName?: string;
  questions: string[];
  priceMin?: number;
  priceMax?: number;
  summary?: string;
};

export type ParsedRequest = {
  categoryId?: string;
  subCategory?: string;
  city?: string;
  district?: string;
  urgency?: "FLEXIBLE" | "THIS_WEEK" | "URGENT";
  title?: string;
  description?: string;
  aiUsed: boolean;
};

/** Türkçe küçük harfe çevir (İ/I dahil). */
function trLower(s: string) {
  return s
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .toLocaleLowerCase("tr");
}

/** Anahtar kelime → kategori adında aranacak parça eşlemesi. */
const CATEGORY_KEYWORDS: { words: string[]; match: string }[] = [
  { words: ["musluk", "su kaç", "sukaç", "tesisat", "kombi", "petek", "kalorifer", "boru", "lavabo", "gider", "sifon"], match: "tesisat" },
  { words: ["elektrik", "priz", "sigorta", "aydınlat", "kablo", "pano", "avize", "kısa devre"], match: "elektrik" },
  { words: ["boya", "badana", "tadilat", "fayans", "sıva", "alçı", "tamir", "usta", "kırım"], match: "tadilat" },
  { words: ["temizlik", "koltuk yıka", "cam sil", "ev temiz", "ofis temiz"], match: "temizlik" },
  { words: ["nakliye", "taşıma", "evden eve", "eşya taşı", "taşınma"], match: "nakliyat" },
  { words: ["mobilya", "montaj", "dolap", "gardırop", "kurulum"], match: "mobilya" },
  { words: ["bahçe", "çim", "peyzaj", "sulama", "budama", "ağaç"], match: "bahçe" },
  { words: ["buzdolab", "çamaşır makine", "bulaşık makine", "beyaz eşya", "fırın", "klima"], match: "beyaz" },
  { words: ["ders", "matematik", "ingilizce", "fizik", "kimya", "gitar", "piyano"], match: "ders" },
  { words: ["kuaför", "cilt", "masaj", "makyaj", "saç", "epilasyon", "tırnak"], match: "güzellik" },
  { words: ["bilgisayar", "yazılım", "ağ kurul", "format", "internet", "modem", "yazıcı"], match: "bilişim" },
  { words: ["düğün", "organizasyon", "catering", "doğum günü", "davet"], match: "organizasyon" },
];

const URGENCY_KEYWORDS: { words: string[]; value: ParsedRequest["urgency"] }[] = [
  { words: ["bugün", "acil", "hemen", "şu an", "en kısa", "acilen"], value: "URGENT" },
  { words: ["bu hafta", "yarın", "birkaç gün", "hafta içinde"], value: "THIS_WEEK" },
];

/** Sezgisel ayrıştırma: kategori/şehir/aciliyet + başlık/açıklama tahmini. */
async function heuristicParse(text: string): Promise<ParsedRequest> {
  const lower = trLower(text);
  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    select: { id: true, name: true, parentId: true },
  });

  // Kategori: anahtar kelimeden ada, addan DB kaydına
  let categoryId: string | undefined;
  for (const rule of CATEGORY_KEYWORDS) {
    if (rule.words.some((w) => lower.includes(w))) {
      const hit = categories.find(
        (c) => !c.parentId && trLower(c.name).includes(rule.match),
      );
      if (hit) {
        categoryId = hit.id;
        break;
      }
    }
  }
  // Doğrudan kategori adı geçiyorsa
  if (!categoryId) {
    const direct = categories.find(
      (c) => !c.parentId && lower.includes(trLower(c.name).split(" ")[0]),
    );
    if (direct) categoryId = direct.id;
  }

  // Şehir
  const city = CITIES.find((c) => lower.includes(trLower(c)));

  // Aciliyet
  let urgency: ParsedRequest["urgency"] = "FLEXIBLE";
  for (const rule of URGENCY_KEYWORDS) {
    if (rule.words.some((w) => lower.includes(w))) {
      urgency = rule.value;
      break;
    }
  }

  // Başlık: ilk cümle / ilk 60 karakter
  const firstSentence = text.split(/[.!?\n]/)[0]?.trim() ?? text.trim();
  const title = firstSentence.slice(0, 70);

  return {
    categoryId,
    city: city ?? undefined,
    urgency,
    title: title.length >= 5 ? title : undefined,
    description: text.trim().length >= 20 ? text.trim() : undefined,
    aiUsed: false,
  };
}

/**
 * Serbest metinden yapılandırılmış talep önerisi çıkarır.
 * Önce sezgisel; OPENAI_API_KEY varsa AI ile zenginleştirir (kategori/başlık/açıklama).
 * AI ASLA uydurma bilgi eklemez; yalnızca kullanıcının anlattığını düzenler.
 */
export async function parseRequestText(text: string): Promise<ParsedRequest> {
  const base = await heuristicParse(text);

  if (!aiEnabled()) return base;

  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true, parentId: null },
    select: { id: true, name: true },
  });

  const system =
    "Sen bir hizmet talebi asistanısın. Kullanıcının serbest metninden yapılandırılmış talep bilgisi çıkar. " +
    "ASLA yeni/uydurma bilgi ekleme; yalnızca metinde geçenleri düzenle ve netleştir. " +
    "Yanıtı SADECE şu JSON şemasıyla ver: " +
    '{"categoryId": string|null, "subCategory": string|null, "city": string|null, "district": string|null, ' +
    '"urgency": "FLEXIBLE"|"THIS_WEEK"|"URGENT", "title": string, "description": string}. ' +
    "title kısa ve açıklayıcı (max 70 karakter), description düzgün Türkçe cümlelerle (metindeki bilgiyle sınırlı).";

  const user =
    `Kategoriler (id: ad):\n${categories.map((c) => `${c.id}: ${c.name}`).join("\n")}\n\n` +
    `Şehir listesi: ${CITIES.join(", ")}\n\n` +
    `Kullanıcı metni:\n"""${text}"""`;

  const ai = await chatJSON<{
    categoryId: string | null;
    subCategory: string | null;
    city: string | null;
    district: string | null;
    urgency: ParsedRequest["urgency"];
    title: string;
    description: string;
  }>(system, user);

  if (!ai) return base;

  // AI'ın verdiği categoryId gerçekten listede var mı doğrula
  const validCat = ai.categoryId && categories.some((c) => c.id === ai.categoryId);

  return {
    categoryId: validCat ? ai.categoryId! : base.categoryId,
    subCategory: ai.subCategory ?? undefined,
    city: ai.city ?? base.city,
    district: ai.district ?? undefined,
    urgency: ai.urgency ?? base.urgency,
    title: (ai.title || base.title || "").slice(0, 70) || undefined,
    description: ai.description || base.description,
    aiUsed: true,
  };
}

/**
 * Fotoğraftan hizmet tespiti (yalnızca AI/vision açıkken).
 * Muhtemel kategori, sorulması gereken sorular ve KABA tahmini fiyat aralığı döner.
 * Fiyat kesin teklif değildir; sadece yönlendirme amaçlıdır.
 * AI kapalıysa null döner (UI kullanıcıyı yazmaya yönlendirir).
 */
export async function detectFromPhoto(imageUrl: string): Promise<PhotoDetection | null> {
  if (!aiEnabled()) return null;

  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true, parentId: null },
    select: { id: true, name: true },
  });

  const system =
    "Sen bir hizmet tespit asistanısın. Verilen fotoğrafa bakarak hangi hizmete ihtiyaç olabileceğini tahmin et. " +
    "ASLA kesin teşhis koyma; olası kategoriyi ve netleştirici soruları öner. " +
    "Fiyat aralığı Türkiye piyasasına göre KABA bir tahmindir. " +
    "Yanıtı SADECE şu JSON ile ver: " +
    '{"categoryId": string|null, "questions": string[], "priceMin": number|null, "priceMax": number|null, "summary": string}. ' +
    "questions en fazla 4 kısa soru içersin. summary tek cümle olsun.";

  const user =
    `Kategoriler (id: ad):\n${categories.map((c) => `${c.id}: ${c.name}`).join("\n")}\n\n` +
    "Bu fotoğraftaki olası işi değerlendir.";

  const ai = await visionJSON<{
    categoryId: string | null;
    questions: string[];
    priceMin: number | null;
    priceMax: number | null;
    summary: string;
  }>(system, user, imageUrl);

  if (!ai) return null;

  const cat = ai.categoryId ? categories.find((c) => c.id === ai.categoryId) : undefined;
  return {
    categoryId: cat?.id,
    categoryName: cat?.name,
    questions: Array.isArray(ai.questions) ? ai.questions.slice(0, 4) : [],
    priceMin: ai.priceMin ?? undefined,
    priceMax: ai.priceMax ?? undefined,
    summary: ai.summary,
  };
}
