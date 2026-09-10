import { prisma } from "@/lib/prisma";

/**
 * Bilinen özellik bayrakları. HEPSİ VARSAYILAN KAPALI.
 * 1. yıl ücretsiz modeli gereği ücret/komisyon/paket özellikleri kapalıdır;
 * admin açana kadar kullanıcıya görünmez ve ücretlendirme yapılmaz.
 */
export const FEATURE_DEFS = [
  { key: "offer_fee", label: "Teklif ücreti", description: "Hizmet verenden teklif başına ücret alınır.", defaultPrice: 0 },
  { key: "commission", label: "Platform komisyonu", description: "Tamamlanan işlerden komisyon alınır.", defaultPrice: 0 },
  { key: "pro_membership", label: "Pro üyelik", description: "Hizmet verenler için ücretli Pro üyelik.", defaultPrice: 199 },
  { key: "job_paid", label: "Ücretli iş ilanı", description: "İş ilanları için paket satışı (ilk 6 ücretsiz sonrası).", defaultPrice: 750 },
  { key: "featured_jobs", label: "Öne çıkan ilan", description: "İşverenler ilanı öne çıkarabilir.", defaultPrice: 149 },
  { key: "urgent_jobs", label: "Acil ilan rozeti", description: "İşverenler ilana 'Acil' rozeti ekleyebilir.", defaultPrice: 99 },
] as const;

export type FeatureKey = (typeof FEATURE_DEFS)[number]["key"];

/** Tek bir bayrağın açık olup olmadığı (kayıt yoksa KAPALI). */
export async function isEnabled(key: FeatureKey): Promise<boolean> {
  const flag = await prisma.featureFlag.findUnique({ where: { key }, select: { enabled: true } });
  return flag?.enabled ?? false;
}

/** Birden çok bayrağı tek seferde getir (harita). */
export async function getEnabledMap(keys: FeatureKey[]): Promise<Record<string, boolean>> {
  const rows = await prisma.featureFlag.findMany({
    where: { key: { in: keys as string[] } },
    select: { key: true, enabled: true },
  });
  const map: Record<string, boolean> = {};
  for (const k of keys) map[k] = false;
  for (const r of rows) map[r.key] = r.enabled;
  return map;
}

/** Admin listesi: tüm bilinen bayraklar + DB durumu (yoksa varsayılan). */
export async function listFlags() {
  const rows = await prisma.featureFlag.findMany();
  const byKey = new Map(rows.map((r) => [r.key, r]));
  return FEATURE_DEFS.map((def) => {
    const row = byKey.get(def.key);
    return {
      key: def.key,
      label: def.label,
      description: def.description,
      enabled: row?.enabled ?? false,
      price: row?.price ?? def.defaultPrice,
    };
  });
}

/** Admin: bir bayrağı aç/kapat ve fiyatını ayarla. */
export async function setFlag(key: string, data: { enabled?: boolean; price?: number | null }) {
  if (!FEATURE_DEFS.some((d) => d.key === key)) {
    throw new Error("Bilinmeyen özellik bayrağı.");
  }
  return prisma.featureFlag.upsert({
    where: { key },
    update: {
      ...(data.enabled !== undefined ? { enabled: data.enabled } : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
    },
    create: {
      key,
      enabled: data.enabled ?? false,
      price: data.price ?? null,
    },
    select: { key: true, enabled: true, price: true },
  });
}
