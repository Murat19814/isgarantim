import Link from "next/link";
import { Building2, ArrowRight, Repeat, Users, ShieldCheck, ClipboardList } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Kurumsal / Toplu Talep",
  description:
    "Apartman, site, şirket, restoran ve oteller için toplu ve düzenli hizmet talepleri.",
};

const EXAMPLES = [
  "20 klima bakımı (ofis)",
  "Düzenli ofis temizliği",
  "50 kişilik personel taşıma",
  "Bina dış cephe boyası",
  "Restoran için düzenli haşere ilaçlama",
  "Site güvenlik / bakım anlaşması",
];

const BENEFITS = [
  { icon: ClipboardList, title: "Tek talep, çok iş", desc: "Miktarı ve kurum tipini gir; uygun ustalar tek talebinle bilgilensin." },
  { icon: Users, title: "Ekiple gelenler", desc: "Büyük işler için ekip halinde çalışan profesyoneller." },
  { icon: ShieldCheck, title: "Güven tercihleri", desc: "Kimliği doğrulanmış, yorumlu ustalarla eşleşme önceliği." },
  { icon: Repeat, title: "Düzenli hizmet", desc: "Periyodik bakım/temizlik gibi tekrar eden işler için de uygun." },
];

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="container-page py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl bg-gradient-to-br from-navy-900 to-navy-700 p-8 text-center text-white">
            <Building2 className="mx-auto h-10 w-10 text-gold-400" />
            <h1 className="mt-3 font-display text-3xl font-extrabold">Kurumsal / Toplu Talep</h1>
            <p className="mt-2 text-navy-100">
              Apartman yönetimi, şirket, restoran ve oteller için toplu ve düzenli
              hizmet taleplerini tek yerden oluşturun.
            </p>
            <Link
              href="/panel/hizmet-al/yeni?bulk=1"
              className="btn-gold mt-5 inline-flex items-center gap-2"
            >
              Toplu talep oluştur <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="card p-5">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-navy-100 text-navy-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 font-display font-bold text-navy-900">{b.title}</h3>
                  <p className="mt-1 text-sm text-navy-500">{b.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 card p-6">
            <h2 className="font-display text-lg font-bold text-navy-900">Örnek talepler</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {EXAMPLES.map((e) => (
                <Link
                  key={e}
                  href={`/panel/hizmet-al/yeni?bulk=1&title=${encodeURIComponent(e)}`}
                  className="rounded-full border border-navy-100 bg-navy-50 px-3 py-1.5 text-sm text-navy-700 transition-colors hover:border-navy-300 hover:bg-navy-100"
                >
                  {e}
                </Link>
              ))}
            </div>
          </div>

          <p className="mt-6 rounded-xl bg-navy-50 p-4 text-center text-sm text-navy-500">
            Çok sayıda lokasyon veya özel sözleşme mi gerekiyor? Talebi oluşturun,
            dilerseniz “Beni arayın” ile ekibimiz size yardımcı olsun.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
