import Link from "next/link";
import { Zap, MapPin, Mic, TrendingUp, Heart, ArrowRight, Siren } from "lucide-react";

const MODES = [
  {
    href: "/acil",
    icon: Siren,
    title: "Acil yardım",
    desc: "Çilingir, su kaçağı, elektrik... hemen çağır.",
    tone: "text-red-600 bg-red-50",
  },
  {
    href: "/panel/hizmet-al/yeni?urgency=URGENT",
    icon: Zap,
    title: "Aynı gün hizmet",
    desc: "Acil işini bugün yaptır, hızlı teklif al.",
    tone: "text-gold-600 bg-gold-50",
  },
  {
    href: "/panel/hizmet-al/yeni",
    icon: MapPin,
    title: "Yakınımdaki",
    desc: "Bölgeni seç, sana en yakın ustalardan teklif al.",
    tone: "text-emerald-600 bg-emerald-50",
  },
  {
    href: "/panel/hizmet-al/yeni",
    icon: Mic,
    title: "Sesli talep",
    desc: "Yazma, konuş! İşini sesli anlat.",
    tone: "text-navy-700 bg-navy-100",
  },
  {
    href: "/fiyat-rehberi",
    icon: TrendingUp,
    title: "Fiyat rehberi",
    desc: "Kategori bazında ortalama fiyatları gör.",
    tone: "text-gold-600 bg-gold-50",
  },
  {
    href: "/panel/favoriler",
    icon: Heart,
    title: "Favorilerim",
    desc: "Beğendiğin ustaları kaydet, tekrar ulaş.",
    tone: "text-red-500 bg-red-50",
  },
];

export function QuickModes() {
  return (
    <section className="container-page py-12">
      <div className="mb-6 text-center">
        <h2 className="section-title">Hızlı modlar</h2>
        <p className="mt-2 text-navy-500">İhtiyacına göre en pratik yoldan başla.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {MODES.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.title}
              href={m.href}
              className="group card p-5 transition-all hover:-translate-y-1 hover:shadow-card"
            >
              <span className={`grid h-11 w-11 place-items-center rounded-2xl ${m.tone}`}>
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-display font-bold text-navy-900">{m.title}</h3>
              <p className="mt-1 text-xs text-navy-500">{m.desc}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                Başla <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
