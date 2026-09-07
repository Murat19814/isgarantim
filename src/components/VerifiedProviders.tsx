import Link from "next/link";
import { Star, ShieldCheck, CheckCircle2, Clock } from "lucide-react";
import { MOCK_PROVIDERS } from "@/lib/mock-data";

export function VerifiedProviders() {
  return (
    <section className="container-page py-16 sm:py-20">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="section-title">Doğrulanmış ustalar</h2>
          <p className="section-subtitle">
            Kimliği ve becerisi doğrulanmış, yüksek puanlı hizmet verenler.
          </p>
        </div>
        <Link href="/hizmet-al" className="btn-outline shrink-0">
          Tümünü gör
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MOCK_PROVIDERS.map((p) => (
          <div key={p.id} className="card p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-navy-800 font-display text-sm font-bold text-gold-400">
                {p.avatar}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="truncate font-semibold text-navy-900">{p.name}</p>
                  {p.verified && (
                    <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                  )}
                </div>
                <p className="truncate text-xs text-navy-400">{p.city}</p>
              </div>
            </div>

            <p className="mt-3 truncate text-sm font-medium text-navy-700">
              {p.category}
            </p>

            <div className="mt-3 flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-gold-400 text-gold-400" />
              <span className="font-semibold text-navy-900">{p.rating.toFixed(1)}</span>
              <span className="text-navy-400">({p.reviewCount})</span>
            </div>

            <div className="mt-3 space-y-1.5 text-xs text-navy-500">
              <p className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {p.completedJobs} tamamlanan iş
              </p>
              <p className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-navy-400" />
                Yanıt süresi {p.responseTime}
              </p>
            </div>

            <Link
              href={`/usta/${p.id}`}
              className="btn-outline mt-4 w-full text-sm"
            >
              Profili gör
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
