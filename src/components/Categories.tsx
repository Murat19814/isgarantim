import Link from "next/link";
import {
  Hammer, Sparkles, Wrench, Zap, Truck, Sofa, Trees, Refrigerator,
  GraduationCap, Scissors, Laptop, PartyPopper, type LucideIcon,
} from "lucide-react";
import { SERVICE_CATEGORIES } from "@/lib/constants";

const ICONS: Record<string, LucideIcon> = {
  Hammer, Sparkles, Wrench, Zap, Truck, Sofa, Trees, Refrigerator,
  GraduationCap, Scissors, Laptop, PartyPopper,
};

export function Categories() {
  return (
    <section className="container-page py-16 sm:py-20">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="section-title">Popüler hizmet kategorileri</h2>
          <p className="section-subtitle">
            İhtiyacın olan hizmeti seç, dakikalar içinde teklif almaya başla.
          </p>
        </div>
        <Link href="/hizmet-al" className="btn-outline shrink-0">
          Tüm kategoriler
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {SERVICE_CATEGORIES.map((cat) => {
          const Icon = ICONS[cat.icon] ?? Wrench;
          return (
            <Link
              key={cat.slug}
              href={`/hizmet-al?kategori=${cat.slug}`}
              className="group flex items-center gap-3 rounded-2xl border border-navy-100 bg-white p-4 transition-all hover:border-emerald-200 hover:shadow-soft"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-navy-900">
                  {cat.name}
                </p>
                <p className="truncate text-xs text-navy-400">
                  {cat.sub.slice(0, 2).join(" · ")}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
