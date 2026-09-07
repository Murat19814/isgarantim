import Link from "next/link";
import { HandHelping, Wrench, Briefcase, Megaphone, ArrowRight } from "lucide-react";

const CARDS = [
  {
    href: "/hizmet-al",
    title: "Hizmet Al",
    desc: "İhtiyacını anlat, doğrulanmış ustalardan teklif al, en uygununu seç.",
    icon: HandHelping,
    accent: "emerald",
  },
  {
    href: "/hizmet-ver",
    title: "Hizmet Ver",
    desc: "Kontör yükle, işlere teklif ver, kazandıkça büyü.",
    icon: Wrench,
    accent: "navy",
  },
  {
    href: "/is-ara",
    title: "İş Ara",
    desc: "Ücretsiz CV oluştur, binlerce güncel ilana tek tıkla başvur.",
    icon: Briefcase,
    accent: "gold",
  },
  {
    href: "/is-ilani-ver",
    title: "İş İlanı Ver",
    desc: "Kurumsal hesap aç, ilanını yayınla, doğru adaylara ulaş.",
    icon: Megaphone,
    accent: "navy",
  },
] as const;

const accentMap: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
  navy: "bg-navy-50 text-navy-700 group-hover:bg-navy-800 group-hover:text-white",
  gold: "bg-gold-50 text-gold-600 group-hover:bg-gold-400 group-hover:text-navy-900",
};

export function EntryCards() {
  return (
    <section className="container-page -mt-10 pb-4 sm:-mt-14">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href}
              href={c.href}
              className="group card animate-fade-up p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-card"
            >
              <span
                className={`grid h-14 w-14 place-items-center rounded-2xl transition-colors duration-200 ${accentMap[c.accent]}`}
              >
                <Icon className="h-7 w-7" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold text-navy-900">
                {c.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">{c.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
                Başla
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
