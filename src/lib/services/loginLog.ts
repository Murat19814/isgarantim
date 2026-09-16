import { prisma } from "@/lib/prisma";

export type LoginEventType = "LOGIN" | "LOGIN_FAILED" | "LOGOUT";

/** Reverse-proxy başlıklarından istemci IP'sini çıkarır. */
export function ipFromHeaders(
  headers: Record<string, string | string[] | undefined> | Headers | undefined,
): string | null {
  if (!headers) return null;
  const get = (k: string): string | null => {
    if (headers instanceof Headers) return headers.get(k);
    const v = headers[k] ?? headers[k.toLowerCase()];
    if (Array.isArray(v)) return v[0] ?? null;
    return (v as string) ?? null;
  };
  const xff = get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return get("x-real-ip") ?? null;
}

export function uaFromHeaders(
  headers: Record<string, string | string[] | undefined> | Headers | undefined,
): string | null {
  if (!headers) return null;
  if (headers instanceof Headers) return headers.get("user-agent");
  const v = headers["user-agent"];
  return Array.isArray(v) ? v[0] ?? null : (v as string) ?? null;
}

function isPrivateIp(ip: string): boolean {
  return (
    ip === "unknown" ||
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("172.17.") ||
    ip.startsWith("172.18.") ||
    ip.startsWith("172.19.") ||
    ip.startsWith("172.2") ||
    ip.startsWith("172.30.") ||
    ip.startsWith("172.31.") ||
    ip.startsWith("fc") ||
    ip.startsWith("fd") ||
    ip.startsWith("fe80")
  );
}

type Geo = { country: string | null; countryCode: string | null; city: string | null };

/**
 * IP → ülke/şehir çözümü (ücretsiz ip-api.com, anahtar gerektirmez).
 * En fazla ~2 sn bekler; hata/timeout durumunda sessizce null döner.
 */
export async function geoLookup(ip: string | null): Promise<Geo> {
  const empty: Geo = { country: null, countryCode: null, city: null };
  if (!ip || isPrivateIp(ip)) return empty;

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,city`,
      { signal: controller.signal, cache: "no-store" },
    );
    clearTimeout(t);
    if (!res.ok) return empty;
    const data = (await res.json()) as {
      status?: string;
      country?: string;
      countryCode?: string;
      city?: string;
    };
    if (data.status !== "success") return empty;
    return {
      country: data.country ?? null,
      countryCode: data.countryCode ?? null,
      city: data.city ?? null,
    };
  } catch {
    return empty;
  }
}

/** Giriş/çıkış olayını kaydeder. Asla hata fırlatmaz (auth akışını bozmasın). */
export async function recordLoginEvent(params: {
  type: LoginEventType;
  userId?: string | null;
  email?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  try {
    const geo = await geoLookup(params.ip ?? null);
    await prisma.loginEvent.create({
      data: {
        type: params.type,
        userId: params.userId ?? null,
        email: params.email ?? null,
        ip: params.ip ?? null,
        userAgent: params.userAgent ?? null,
        country: geo.country,
        countryCode: geo.countryCode,
        city: geo.city,
      },
    });
  } catch {
    // Loglama başarısız olsa bile giriş akışını etkileme.
  }
}

// ─────────────────────────────────────────────
// ADMIN LİSTELEME + ÖZET
// ─────────────────────────────────────────────

export type LoginEventFilter = {
  type?: string; // LOGIN | LOGIN_FAILED | LOGOUT
  country?: string; // countryCode
  q?: string; // e-posta/IP arama
};

export async function listLoginEvents(filter: LoginEventFilter = {}) {
  const where: Record<string, unknown> = {};
  if (filter.type) where.type = filter.type;
  if (filter.country) where.countryCode = filter.country;
  if (filter.q) {
    where.OR = [
      { email: { contains: filter.q, mode: "insensitive" } },
      { ip: { contains: filter.q } },
      { city: { contains: filter.q, mode: "insensitive" } },
    ];
  }

  return prisma.loginEvent.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 300,
    include: {
      user: { select: { id: true, fullName: true, email: true, roles: true } },
    },
  });
}

/** Ülkelere göre giriş sayısı (sıralı) — süper admin özetinde gösterilir. */
export async function loginCountsByCountry() {
  const grouped = await prisma.loginEvent.groupBy({
    by: ["countryCode", "country"],
    _count: true,
    orderBy: { _count: { countryCode: "desc" } },
  });
  return grouped
    .map((g) => ({
      countryCode: g.countryCode,
      country: g.country ?? "Bilinmiyor",
      count: g._count,
    }))
    .sort((a, b) => b.count - a.count);
}
