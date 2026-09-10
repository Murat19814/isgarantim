import Link from "next/link";
import { Zap, Star, CheckCircle2, Award, MapPin } from "lucide-react";
import { listSameDayProviders } from "@/lib/services/providerProfile";

export async function SameDayProviders() {
  let providers: Awaited<ReturnType<typeof listSameDayProviders>> = [];
  try {
    providers = await listSameDayProviders({ take: 8 });
  } catch {
    providers = [];
  }

  if (providers.length === 0) return null;

  return (
    <section className="container-page py-12">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-red-50 text-red-600">
              <Zap className="h-5 w-5" />
            </span>
            Bugün çözülsün
          </h2>
          <p className="section-subtitle">Bugün müsait, aynı gün hizmet verebilen profesyoneller.</p>
        </div>
        <Link href="/panel/hizmet-al/yeni?urgency=URGENT" className="btn-outline shrink-0">
          Acil talep oluştur
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {providers.map((p) => (
          <Link key={p.user.id} href={`/hizmet-veren/${p.user.id}`} className="group card p-5 transition-all hover:-translate-y-1 hover:shadow-card">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-navy-800 font-display text-sm font-bold text-gold-400">
                {p.user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.user.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  p.user.fullName.slice(0, 2).toUpperCase()
                )}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="truncate font-semibold text-navy-900">{p.user.fullName}</p>
                  {p.user.isFounder && <Award className="h-4 w-4 shrink-0 text-gold-500" />}
                </div>
                <p className="truncate text-xs text-navy-400">{p.headline ?? "Hizmet Veren"}</p>
              </div>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
              <Zap className="h-3 w-3" /> Bugün müsait
            </span>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-navy-500">
              {p.city && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.city}</span>}
              {p.ratingCount > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3 fill-gold-400 text-gold-400" /> {p.ratingAvg.toFixed(1)}
                </span>
              )}
              <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> {p.completedJobs} iş</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
