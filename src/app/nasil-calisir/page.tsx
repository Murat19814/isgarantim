import Link from "next/link";
import {
  ShieldCheck, FileText, Users, Wallet, MessageSquare, CheckCircle2,
  Briefcase, Building2, Search, ArrowRight, Star,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = { title: "Nasıl Çalışır?" };

const CUSTOMER_STEPS = [
  { icon: FileText, title: "Talep oluştur", desc: "Çok adımlı formla kategori, şehir ve bütçeni belirt; ne istediğini anlat." },
  { icon: Users, title: "Teklifleri karşılaştır", desc: "Doğrulanmış ustalardan gelen teklifleri fiyat, puan ve süreye göre kıyasla." },
  { icon: Wallet, title: "Ödemeyi emanete al", desc: "Tutarı güvenli emanet hesabına yatır; iş bitmeden ustaya geçmez." },
  { icon: CheckCircle2, title: "Onayla, ödeme serbest", desc: "İşi teslim al, onayla; ödeme ustaya aktarılır. Sorun olursa itiraz aç." },
];

const PROVIDER_STEPS = [
  { icon: Wallet, title: "Kontör yükle", desc: "Tekliflerde kullanmak için kontör satın al." },
  { icon: Briefcase, title: "Açık taleplere teklif ver", desc: "Sana uygun işleri bul, rekabetçi teklifini gönder." },
  { icon: MessageSquare, title: "Müşteriyle yaz", desc: "Platform içi mesajlaşmayla detayları netleştir." },
  { icon: Star, title: "Kazan ve büyü", desc: "İşi teslim et, ödemeni al, puanınla öne çık." },
];

const JOB_STEPS = [
  { icon: Briefcase, title: "CV oluştur", desc: "Deneyim, eğitim ve yeteneklerinle profesyonel CV'ni hazırla, PDF indir." },
  { icon: Search, title: "İlanlara başvur", desc: "Filtrele, sana uygun ilanı bul, tek tıkla başvur." },
  { icon: Building2, title: "Firmalar seni bulsun", desc: "CV'ni görünür yap; işverenler aday havuzunda seni filtreleyip davet etsin." },
  { icon: CheckCircle2, title: "Görüşmeye git", desc: "Davetleri panelinden takip et, sürecini yönet." },
];

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="border-b border-navy-100 bg-navy-50/40">
          <div className="container-page py-16 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-navy-800 text-gold-400">
              <ShieldCheck className="h-8 w-8" />
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold text-navy-900">
              Nasıl Çalışır?
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-navy-500">
              İşKalkan; hizmet alan, hizmet veren, iş arayan ve işveren için tek güvenli platform.
              Emanet ödeme ve doğrulanmış profillerle işini de ödemeni de güvenceye alır.
            </p>
          </div>
        </section>

        <Block
          badge="Hizmet almak isteyenler"
          title="4 adımda güvenli hizmet"
          steps={CUSTOMER_STEPS}
          ctaHref="/hizmet-al"
          ctaLabel="Hizmet talebi oluştur"
        />

        <Block
          badge="Hizmet verenler / ustalar"
          title="Teklif ver, kazan"
          steps={PROVIDER_STEPS}
          ctaHref="/hizmet-ver"
          ctaLabel="Hizmet vermeye başla"
          alt
        />

        <Block
          badge="İş arayanlar & işverenler"
          title="Kariyer ve işe alım"
          steps={JOB_STEPS}
          ctaHref="/is-ara"
          ctaLabel="İş ilanlarına göz at"
        />

        {/* Alt CTA */}
        <section className="bg-navy-900">
          <div className="container-page flex flex-col items-center gap-4 py-14 text-center">
            <h2 className="font-display text-2xl font-extrabold text-white">
              Hemen başla, dakikalar içinde
            </h2>
            <p className="max-w-xl text-navy-200">
              Ücretsiz üye ol; ister hizmet al, ister teklif ver, ister iş bul.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/kayit" className="btn-gold">Üye Ol</Link>
              <Link href="/giris" className="btn-outline border-white/30 text-white hover:bg-white/10">
                Giriş Yap
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Block({
  badge, title, steps, ctaHref, ctaLabel, alt,
}: {
  badge: string;
  title: string;
  steps: { icon: typeof FileText; title: string; desc: string }[];
  ctaHref: string;
  ctaLabel: string;
  alt?: boolean;
}) {
  return (
    <section className={alt ? "bg-navy-50/40" : ""}>
      <div className="container-page py-14">
        <span className="badge-emerald">{badge}</span>
        <h2 className="mt-3 font-display text-2xl font-extrabold text-navy-900">{title}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="card relative p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="absolute right-4 top-4 font-display text-3xl font-extrabold text-navy-100">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-navy-900">{s.title}</h3>
                <p className="mt-1 text-sm text-navy-500">{s.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-8">
          <Link href={ctaHref} className="btn-primary">
            {ctaLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
