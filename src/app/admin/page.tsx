import Link from "next/link";
import {
  Users, Wrench, ClipboardList, Wallet, TrendingUp, Gavel, Briefcase, Flag, ArrowRight, ShieldAlert,
} from "lucide-react";
import { getAdminStats } from "@/lib/services/admin";
import { formatTRY } from "@/lib/utils";

export default async function AdminDashboard() {
  const s = await getAdminStats();

  const cards = [
    { label: "Toplam kullanıcı", value: s.userCount, icon: Users, href: "/admin/kullanicilar", tone: "navy" },
    { label: "Hizmet veren", value: s.providerCount, icon: Wrench, href: "/admin/kullanicilar", tone: "navy" },
    { label: "Açık talep", value: s.openRequests, icon: ClipboardList, href: "/admin/talepler", tone: "emerald" },
    { label: "Emanetteki tutar", value: formatTRY(s.escrowAmount), icon: Wallet, href: "/admin/odemeler", tone: "gold" },
    { label: "Platform geliri", value: formatTRY(s.revenue), icon: TrendingUp, href: "/admin/odemeler", tone: "emerald" },
    { label: "Açık itiraz", value: s.openDisputes, icon: Gavel, href: "/admin/itirazlar", tone: "red" },
    { label: "Aktif ilan", value: s.activePostings, icon: Briefcase, href: "/admin/ilanlar", tone: "navy" },
    { label: "Bekleyen şikayet", value: s.unresolvedComplaints, icon: Flag, href: "/admin/sikayetler", tone: "red" },
    { label: "Açık sorun bildirimi", value: s.openProblems, icon: ShieldAlert, href: "/admin/sorunlar", tone: "red" },
  ];

  const tones: Record<string, string> = {
    navy: "bg-navy-100 text-navy-700",
    emerald: "bg-emerald-50 text-emerald-600",
    gold: "bg-gold-50 text-gold-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900">Genel Bakış</h1>
      <p className="mt-1 text-sm text-navy-500">Platform genel durumu ve hızlı erişim.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} href={c.href} className="group card p-5 transition-all hover:-translate-y-0.5 hover:shadow-card">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${tones[c.tone]}`}>
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 font-display text-2xl font-extrabold text-navy-900">{c.value}</p>
              <p className="text-xs text-navy-500">{c.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/itirazlar" className="card flex items-center justify-between p-5 hover:shadow-card">
          <div>
            <p className="font-semibold text-navy-900">İtirazları çöz</p>
            <p className="text-sm text-navy-500">Emanetteki ödemeyi iade et veya hizmet verene aktar.</p>
          </div>
          <ArrowRight className="h-5 w-5 text-navy-300" />
        </Link>
        <Link href="/admin/kategoriler" className="card flex items-center justify-between p-5 hover:shadow-card">
          <div>
            <p className="font-semibold text-navy-900">Kategori yönetimi</p>
            <p className="text-sm text-navy-500">Hizmet ve iş ilanı kategorilerini ekle/pasifle.</p>
          </div>
          <ArrowRight className="h-5 w-5 text-navy-300" />
        </Link>
      </div>
    </div>
  );
}
