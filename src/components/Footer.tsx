import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { APP_DOMAIN } from "@/lib/constants";

const COLS = [
  {
    title: "Hizmetler",
    links: [
      { href: "/hizmet-al", label: "Hizmet Al" },
      { href: "/hizmet-ver", label: "Hizmet Ver" },
      { href: "/nasil-calisir", label: "Nasıl Çalışır?" },
      { href: "/kontor", label: "Kontör Satın Al" },
    ],
  },
  {
    title: "Kariyer",
    links: [
      { href: "/is-ara", label: "İş Ara" },
      { href: "/is-ilani-ver", label: "İş İlanı Ver" },
      { href: "/cv-olustur", label: "CV Oluştur" },
      { href: "/firmalar", label: "Firmalar" },
    ],
  },
  {
    title: "Kurumsal",
    links: [
      { href: "/hakkimizda", label: "Hakkımızda" },
      { href: "/guvenlik", label: "Güvenlik & Emanet" },
      { href: "/iletisim", label: "İletişim" },
      { href: "/yardim", label: "Yardım Merkezi" },
    ],
  },
  {
    title: "Yasal",
    links: [
      { href: "/kvkk", label: "KVKK / Gizlilik" },
      { href: "/kullanim-kosullari", label: "Kullanım Koşulları" },
      { href: "/mesafeli-satis", label: "Mesafeli Satış" },
      { href: "/cerez", label: "Çerez Politikası" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-navy-100 bg-white">
      <div className="container-page py-12">
        <div className="grid gap-8 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-800 text-gold-400">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span className="font-display text-lg font-extrabold text-navy-900">
                İş<span className="text-emerald-600">Kalkan</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-navy-500">
              İşin de ödemen de güvende. Doğrulanmış ustalar, emanet ödeme ve
              binlerce iş ilanı tek platformda.
            </p>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-navy-900">{col.title}</h4>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-navy-500 transition-colors hover:text-emerald-600"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-navy-100 pt-6 sm:flex-row">
          <p className="text-xs text-navy-400">
            © {new Date().getFullYear()} İşKalkan · {APP_DOMAIN} · Tüm hakları
            saklıdır.
          </p>
          <p className="text-xs text-navy-400">
            Ödemeler lisanslı ödeme kuruluşu güvencesiyle işlenir.
          </p>
        </div>
      </div>
    </footer>
  );
}
