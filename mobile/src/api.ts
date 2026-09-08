import Constants from "expo-constants";

/**
 * API taban adresi. app.json → expo.extra.apiBaseUrl'den okunur.
 * Yerel geliştirmede telefonun bilgisayara erişebilmesi için
 * bilgisayarın LAN IP'sini kullan (ör. http://192.168.1.20:3000).
 */
export const API_BASE_URL: string =
  (Constants.expoConfig?.extra as { apiBaseUrl?: string })?.apiBaseUrl ??
  "https://isgarantim.com";

export type JobPosting = {
  id: string;
  title: string;
  city?: string | null;
  workType?: string | null;
  description?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  company?: { name?: string | null; logoUrl?: string | null } | null;
  createdAt?: string;
};

/** İlanın web'deki detay/başvuru adresi. */
export function jobWebUrl(id: string): string {
  return `${API_BASE_URL}/is-ara/${id}`;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`İstek başarısız (${res.status})`);
  return (await res.json()) as T;
}

/** Herkese açık iş ilanlarını getirir. */
export async function fetchJobs(query?: string): Promise<JobPosting[]> {
  const qs = query ? `?q=${encodeURIComponent(query)}` : "";
  const data = await getJson<unknown>(`/api/job-postings${qs}`);
  // API'nin döndürebileceği farklı biçimlere karşı esnek ol.
  if (Array.isArray(data)) return data as JobPosting[];
  const obj = data as { postings?: JobPosting[]; items?: JobPosting[] };
  return obj.postings ?? obj.items ?? [];
}
