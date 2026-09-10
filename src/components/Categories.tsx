import Link from "next/link";
import {
  Hammer, Sparkles, Wrench, Zap, Truck, Sofa, Trees, Refrigerator,
  GraduationCap, Scissors, Laptop, PartyPopper, type LucideIcon,
} from "lucide-react";
import { SERVICE_CATEGORIES, CATEGORY_IMAGES } from "@/lib/constants";

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

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {SERVICE_CATEGORIES.map((cat) => {
          const Icon = ICONS[cat.icon] ?? Wrench;
          const img = CATEGORY_IMAGES[cat.slug];
          return (
            <Link
              key={cat.slug}
              href={`/hizmet-al?kategori=${cat.slug}`}
              className="group overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-soft transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-card"
            >
              {/* Görsel */}
              <div className="relative h-28 w-full overflow-hidden bg-gradient-to-br from-navy-700 to-emerald-700 sm:h-32">
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={cat.name}
                    loading="lazy"
                    className="h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 via-navy-900/10 to-transparent" />
                <span className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-xl bg-white/90 text-emerald-600 shadow-sm">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="absolute bottom-2 left-3 right-3 truncate font-display text-sm font-bold text-white drop-shadow">
                  {cat.name}
                </p>
              </div>
              {/* Alt kategoriler */}
              <div className="p-3">
                <p className="truncate text-xs text-navy-400">
                  {cat.sub.slice(0, 3).join(" · ")}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
