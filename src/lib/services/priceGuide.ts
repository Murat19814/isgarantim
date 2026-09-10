import { ServiceRequestStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type PriceRow = {
  categoryId: string;
  name: string;
  count: number;
  min: number;
  avg: number;
  max: number;
};

/**
 * Kategori bazında fiyat rehberi.
 * Tamamlanmış işlerdeki anlaşılan fiyatlardan (agreedPrice) üst kategoriye göre
 * min/ortalama/maks hesaplar. Yeterli veri yoksa kategori listelenmez.
 */
export async function getPriceGuide(): Promise<PriceRow[]> {
  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    select: { id: true, name: true, parentId: true },
  });

  // Alt kategori → üst kategori eşlemesi
  const topOf = new Map<string, string>();
  const topName = new Map<string, string>();
  for (const c of categories) {
    if (!c.parentId) {
      topOf.set(c.id, c.id);
      topName.set(c.id, c.name);
    }
  }
  for (const c of categories) {
    if (c.parentId) topOf.set(c.id, c.parentId);
  }

  const requests = await prisma.serviceRequest.findMany({
    where: {
      status: ServiceRequestStatus.COMPLETED,
      agreedPrice: { not: null },
    },
    select: { categoryId: true, agreedPrice: true },
  });

  const buckets = new Map<string, number[]>();
  for (const r of requests) {
    const top = topOf.get(r.categoryId) ?? r.categoryId;
    const arr = buckets.get(top) ?? [];
    arr.push(r.agreedPrice!);
    buckets.set(top, arr);
  }

  const rows: PriceRow[] = [];
  for (const [topId, prices] of buckets) {
    if (prices.length === 0) continue;
    const sum = prices.reduce((a, b) => a + b, 0);
    rows.push({
      categoryId: topId,
      name: topName.get(topId) ?? "Diğer",
      count: prices.length,
      min: Math.min(...prices),
      avg: Math.round(sum / prices.length),
      max: Math.max(...prices),
    });
  }

  return rows.sort((a, b) => b.count - a.count);
}
