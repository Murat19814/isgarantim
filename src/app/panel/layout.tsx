import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-navy-50/40">
      <header className="sticky top-0 z-40 border-b border-navy-100 bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/panel" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-800 text-gold-400">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-extrabold text-navy-900">
              İş<span className="text-emerald-600">Kalkan</span>
              <span className="ml-2 text-sm font-medium text-navy-400">Panel</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className="btn-ghost text-sm">
              Siteye dön
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="container-page py-8">{children}</main>
    </div>
  );
}
