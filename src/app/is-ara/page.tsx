import Link from "next/link";
import { Search, MapPin, Briefcase, Wallet, Building2, BadgeCheck } from "lucide-react";
import { listJobPostings, listJobCategories } from "@/lib/services/jobs";
import { jobFilterSchema } from "@/lib/validations/jobs";
import { CITIES, WORK_TYPE_LABELS, WORK_TYPE_VALUES } from "@/lib/constants";
import { formatTRY } from "@/lib/utils";

export const metadata = { title: "İş İlanları" };

export default async function Page({
  searchParams,
}: {
  searchParams: { q?: string; city?: string; categoryId?: string; workType?: string };
}) {
  const parsed = jobFilterSchema.safeParse({
    q: searchParams.q || undefined,
    city: searchParams.city || undefined,
    categoryId: searchParams.categoryId || undefined,
    workType: searchParams.workType || undefined,
  });
  const filter = parsed.success ? parsed.data : {};

  const [postings, categories] = await Promise.all([
    listJobPostings(filter),
    listJobCategories(),
  ]);

  return (
    <div className="container-page py-10">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-extrabold text-navy-900">İş İlanları</h1>
        <p className="mt-2 text-navy-500">Sana uygun işi bul, tek tıkla başvur.</p>
      </div>

      {/* Filtre formu (SSR, GET) */}
      <form method="get" className="card mb-8 grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-5">
        <input name="q" defaultValue={searchParams.q ?? ""} className="input lg:col-span-2" placeholder="Pozisyon veya anahtar kelime" />
        <select name="city" defaultValue={searchParams.city ?? ""} className="input">
          <option value="">Tüm şehirler</option>
          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="categoryId" defaultValue={searchParams.categoryId ?? ""} className="input">
          <option value="">Tüm kategoriler</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="workType" defaultValue={searchParams.workType ?? ""} className="input">
          <option value="">Tüm çalışma şekilleri</option>
          {WORK_TYPE_VALUES.map((w) => <option key={w} value={w}>{WORK_TYPE_LABELS[w]}</option>)}
        </select>
        <button type="submit" className="btn-primary sm:col-span-2 lg:col-span-5">
          <Search className="h-4 w-4" /> Ara
        </button>
      </form>

      {/* Sonuçlar */}
      {postings.length === 0 ? (
        <div className="card p-10 text-center text-navy-500">
          Kriterlere uygun ilan bulunamadı.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {postings.map((p) => (
            <Link key={p.id} href={`/is-ara/${p.id}`}
              className={p.isFeatured
                ? "group card p-5 ring-2 ring-gold-200 transition-all hover:-translate-y-0.5 hover:shadow-card"
                : "group card p-5 transition-all hover:-translate-y-0.5 hover:shadow-card"}>
              {(p.isFeatured || p.isUrgent) && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {p.isFeatured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-semibold text-gold-700">
                      ⭐ Öne çıkan
                    </span>
                  )}
                  {p.isUrgent && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                      Acil
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-3">
                {p.company.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.company.logoUrl} alt="" className="h-11 w-11 rounded-xl object-cover" />
                ) : (
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy-100 text-navy-500">
                    <Building2 className="h-5 w-5" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-sm font-medium text-navy-600">
                    {p.company.name}
                    {p.company.verified && <BadgeCheck className="h-4 w-4 text-emerald-600" />}
                  </p>
                  <p className="text-xs text-navy-400">{p.category.name}</p>
                </div>
              </div>
              <h3 className="mt-3 font-display text-lg font-bold text-navy-900 group-hover:text-emerald-700">
                {p.title}
              </h3>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-500">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {p.city}</span>
                <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {WORK_TYPE_LABELS[p.workType] ?? p.workType}</span>
                {(p.salaryMin || p.salaryMax) && (
                  <span className="inline-flex items-center gap-1">
                    <Wallet className="h-3.5 w-3.5" />
                    {p.salaryMin ? formatTRY(p.salaryMin) : "?"} - {p.salaryMax ? formatTRY(p.salaryMax) : "?"}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
