import Link from "next/link";
import { MapPin, Briefcase, Clock, ArrowRight } from "lucide-react";
import { MOCK_JOBS } from "@/lib/mock-data";

export function LatestJobs() {
  return (
    <section className="bg-navy-50/60 py-16 sm:py-20">
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="section-title">Güncel iş ilanları</h2>
            <p className="section-subtitle">
              Kurumsal firmaların en yeni ilanları — hemen başvur.
            </p>
          </div>
          <Link href="/is-ara" className="btn-outline shrink-0">
            Tüm ilanlar
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {MOCK_JOBS.map((j) => (
            <Link
              key={j.id}
              href={`/is/${j.id}`}
              className="group card flex items-center gap-4 p-5 transition-all hover:shadow-card"
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-navy-800 font-display text-sm font-bold text-white">
                {j.logo}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-navy-900">{j.title}</p>
                <p className="truncate text-sm text-navy-500">{j.company}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-navy-400">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {j.city}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" /> {j.workType}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {j.postedAt}
                  </span>
                </div>
                {j.salary && (
                  <span className="badge-emerald mt-2">{j.salary}</span>
                )}
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-navy-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
