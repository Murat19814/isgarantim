"use client";

import { useState } from "react";
import { Search, MapPin, ShieldCheck, Star, Lock } from "lucide-react";
import { CITIES, APP_SLOGAN } from "@/lib/constants";

export function Hero() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");

  return (
    <section className="relative overflow-hidden bg-navy-900 bg-hero-radial text-white">
      <div className="container-page relative py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="badge-gold mx-auto mb-5 inline-flex bg-gold-400/15 text-gold-300 ring-1 ring-gold-400/30">
            <ShieldCheck className="h-3.5 w-3.5" /> Güvenli ödeme & doğrulanmış ustalar
          </span>

          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-gradient-gold">{APP_SLOGAN}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-navy-100 sm:text-lg">
            Doğrulanmış ustalardan teklif al, en uygununu seç. Ödemen iş
            tamamlanana kadar İşKalkan güvencesinde bekler. İş mi arıyorsun?
            Binlerce güncel ilan seni bekliyor.
          </p>

          {/* Arama kutusu */}
          <form
            action="/hizmet-al"
            className="mx-auto mt-8 flex w-full max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-card sm:flex-row"
          >
            <div className="flex flex-1 items-center gap-2 rounded-xl px-3">
              <Search className="h-5 w-5 shrink-0 text-navy-400" />
              <input
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Hangi hizmete ihtiyacın var? (ör. boya, temizlik)"
                className="w-full bg-transparent py-3 text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 border-navy-100 px-3 sm:border-l">
              <MapPin className="h-5 w-5 shrink-0 text-navy-400" />
              <select
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-transparent py-3 text-sm text-navy-900 focus:outline-none sm:w-40"
              >
                <option value="">Şehir seç</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary sm:px-8">
              Ara
            </button>
          </form>

          {/* Güven göstergeleri */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-navy-100">
            <span className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-400" /> Emanet (escrow) ödeme
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Kimlik doğrulama
            </span>
            <span className="inline-flex items-center gap-2">
              <Star className="h-4 w-4 text-gold-400" /> Gerçek yorumlar
            </span>
          </div>
        </div>
      </div>

      {/* alt dalga */}
      <div className="h-8 w-full bg-white [clip-path:ellipse(75%_100%_at_50%_100%)]" />
    </section>
  );
}
