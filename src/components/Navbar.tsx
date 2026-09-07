"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Menu, X, ShieldCheck, LayoutDashboard } from "lucide-react";

const NAV_LINKS = [
  { href: "/hizmet-al", label: "Hizmet Al" },
  { href: "/hizmet-ver", label: "Hizmet Ver" },
  { href: "/is-ara", label: "İş Ara" },
  { href: "/is-ilani-ver", label: "İş İlanı Ver" },
  { href: "/nasil-calisir", label: "Nasıl Çalışır?" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { status } = useSession();
  const isAuthed = status === "authenticated";

  return (
    <header className="sticky top-0 z-50 border-b border-navy-100 bg-white/90 backdrop-blur-md">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-800 text-gold-400">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-navy-900">
            İş<span className="text-emerald-600">Kalkan</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-navy-700 transition-colors hover:bg-navy-50 hover:text-navy-900"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {isAuthed ? (
            <Link href="/panel" className="btn-primary">
              <LayoutDashboard className="h-4 w-4" /> Panelim
            </Link>
          ) : (
            <>
              <Link href="/giris" className="btn-ghost">
                Giriş Yap
              </Link>
              <Link href="/kayit" className="btn-primary">
                Üye Ol
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg text-navy-800 hover:bg-navy-50 lg:hidden"
          aria-label="Menüyü aç/kapat"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-navy-100 bg-white lg:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-navy-700 hover:bg-navy-50"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              {isAuthed ? (
                <Link href="/panel" className="btn-primary flex-1" onClick={() => setOpen(false)}>
                  <LayoutDashboard className="h-4 w-4" /> Panelim
                </Link>
              ) : (
                <>
                  <Link href="/giris" className="btn-outline flex-1" onClick={() => setOpen(false)}>
                    Giriş Yap
                  </Link>
                  <Link href="/kayit" className="btn-primary flex-1" onClick={() => setOpen(false)}>
                    Üye Ol
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
