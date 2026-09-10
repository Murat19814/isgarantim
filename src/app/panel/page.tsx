import Link from "next/link";
import { redirect } from "next/navigation";
import {
  HandHelping, Wrench, Briefcase, Building2, ShieldAlert,
  Mail, Smartphone, ArrowRight, ShieldCheck, Bell, Gift, Heart, TrendingUp,
} from "lucide-react";
import { auth } from "@/lib/auth/session";
import { ROLE_LABELS, type UserRole } from "@/lib/constants";

export const metadata = { title: "Kontrol Paneli" };

const ROLE_CARDS: Record<
  Exclude<UserRole, "admin">,
  { href: string; icon: typeof HandHelping; desc: string }
> = {
  customer: {
    href: "/panel/hizmet-al",
    icon: HandHelping,
    desc: "Hizmet talepleri oluştur, teklifleri karşılaştır, ödemeni güvende tut.",
  },
  provider: {
    href: "/panel/hizmet-ver",
    icon: Wrench,
    desc: "Kontör yükle, açık taleplere teklif ver, kazançlarını takip et.",
  },
  jobseeker: {
    href: "/panel/is-ara",
    icon: Briefcase,
    desc: "CV'ni oluştur, ilanlara başvur, görüşme davetlerini gör.",
  },
  employer: {
    href: "/panel/isveren",
    icon: Building2,
    desc: "Firma hesabını yönet, ilan yayınla, adayları filtrele.",
  },
};

export default async function PanelPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel");

  const { name, roles, emailVerified, phoneVerified } = session.user;
  const activeRoles = roles.map((r) => r.toLowerCase()) as UserRole[];
  const needsVerify = !emailVerified || !phoneVerified;

  return (
    <div>
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-extrabold text-navy-900">
          Merhaba, {name} 👋
        </h1>
        <p className="text-sm text-navy-500">
          Rollerin:{" "}
          {roles.map((r) => (
            <span key={r} className="badge-navy mr-1">
              {ROLE_LABELS[r.toLowerCase() as UserRole]}
            </span>
          ))}
        </p>
      </div>

      {needsVerify && (
        <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl border border-gold-200 bg-gold-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
            <div className="text-sm text-navy-700">
              <p className="font-semibold">Hesabını doğrula</p>
              <p className="mt-0.5 flex flex-wrap gap-3 text-xs">
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  E-posta: {emailVerified ? "✅" : "❌"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Smartphone className="h-3.5 w-3.5" />
                  Telefon: {phoneVerified ? "✅" : "❌"}
                </span>
              </p>
            </div>
          </div>
          <Link href={`/dogrula?userId=${session.user.id}`} className="btn-gold text-sm">
            Şimdi doğrula
          </Link>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {activeRoles
          .filter((r): r is Exclude<UserRole, "admin"> => r in ROLE_CARDS)
          .map((role) => {
            const card = ROLE_CARDS[role];
            const Icon = card.icon;
            return (
              <Link
                key={role}
                href={card.href}
                className="group card p-6 transition-all hover:-translate-y-1 hover:shadow-card"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-navy-900">
                  {ROLE_LABELS[role]}
                </h3>
                <p className="mt-1 text-sm text-navy-500">{card.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
                  Panele git
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}

        {activeRoles.includes("admin") && (
          <Link
            href="/admin"
            className="group card border-navy-800 bg-navy-900 p-6 text-white transition-all hover:-translate-y-1"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-gold-400">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold">Yönetim Paneli</h3>
            <p className="mt-1 text-sm text-navy-200">
              Kullanıcı, ödeme, teklif, ilan ve anlaşmazlık yönetimi.
            </p>
          </Link>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
        <Link
          href="/panel/ayarlar/bildirimler"
          className="inline-flex items-center gap-2 text-sm font-medium text-navy-500 hover:text-navy-800"
        >
          <Bell className="h-4 w-4" /> Bildirim tercihleri
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/davet"
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          <Gift className="h-4 w-4" /> Arkadaşını davet et, Kurucu Üye ol
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/panel/favoriler"
          className="inline-flex items-center gap-2 text-sm font-medium text-navy-500 hover:text-navy-800"
        >
          <Heart className="h-4 w-4" /> Favori hizmet verenlerim
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/fiyat-rehberi"
          className="inline-flex items-center gap-2 text-sm font-medium text-navy-500 hover:text-navy-800"
        >
          <TrendingUp className="h-4 w-4" /> Fiyat rehberi
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
