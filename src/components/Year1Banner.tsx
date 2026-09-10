import { Gift, Sparkles } from "lucide-react";

/** 1. yıl ücretsiz kampanya sloganı — ana sayfa şeridi. */
export function Year1Banner() {
  return (
    <section className="container-page py-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-900 via-navy-800 to-emerald-800 px-6 py-8 sm:px-10 sm:py-10">
        <Sparkles className="absolute -right-4 -top-4 h-28 w-28 text-gold-400/20" />
        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gold-400 text-navy-900">
            <Gift className="h-7 w-7" />
          </span>
          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-300">
              Lansmana özel · 1. yıl
            </div>
            <p className="font-display text-lg font-extrabold leading-snug text-white sm:text-2xl">
              Bir yıl boyunca kontör yok, komisyon yok, teklif ücreti yok.
            </p>
            <p className="mt-1 text-sm text-emerald-100 sm:text-base">
              Hizmetini bul, teklifini ver, kazancın senin olsun.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
