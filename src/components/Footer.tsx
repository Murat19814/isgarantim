import Link from "next/link";
import { ShieldCheck, Phone, MessageCircle, MapPin } from "lucide-react";
import { APP_DOMAIN, LEGAL } from "@/lib/constants";

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
            <ul className="mt-4 space-y-1.5 text-sm text-navy-500">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" /> {LEGAL.address}
              </li>
              <li>
                <a href={`tel:${LEGAL.phoneLink}`} className="flex items-center gap-2 hover:text-emerald-600">
                  <Phone className="h-4 w-4 text-emerald-600" /> {LEGAL.phone}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${LEGAL.whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-emerald-600"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-600" /> WhatsApp: {LEGAL.whatsapp}
                </a>
              </li>
            </ul>
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
