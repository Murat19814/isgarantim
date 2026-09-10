"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ClipboardList, Wallet, Gavel,
  Briefcase, Tags, Flag, ShieldCheck, ShieldAlert, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Genel Bakış", icon: LayoutDashboard, exact: true },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: Users },
  { href: "/admin/talepler", label: "Hizmet Talepleri", icon: ClipboardList },
  { href: "/admin/odemeler", label: "Ödemeler", icon: Wallet },
  { href: "/admin/itirazlar", label: "İtirazlar", icon: Gavel },
  { href: "/admin/ilanlar", label: "İş İlanları", icon: Briefcase },
  { href: "/admin/kategoriler", label: "Kategoriler", icon: Tags },
  { href: "/admin/sikayetler", label: "Şikayetler", icon: Flag },
  { href: "/admin/sorunlar", label: "Sorun Bildirimleri", icon: ShieldAlert },
  { href: "/admin/dogrulamalar", label: "Doğrulamalar", icon: ShieldCheck },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col gap-1 border-b border-navy-800 bg-navy-900 p-3 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <Link href="/admin" className="mb-4 flex items-center gap-2 px-2 py-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-gold-400">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <span className="font-display text-lg font-extrabold text-white">
          İşKalkan <span className="text-gold-400">Admin</span>
        </span>
      </Link>

      <nav className="flex flex-wrap gap-1 lg:flex-col">
        {LINKS.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-navy-200 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden pt-4 lg:block">
        <Link
          href="/panel"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-navy-300 hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" /> Siteye dön
        </Link>
      </div>
    </aside>
  );
}
