import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { APP_SLOGAN } from "@/lib/constants";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Sol marka paneli */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-navy-900 bg-hero-radial p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-gold-400">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <span className="font-display text-xl font-extrabold">
            İş<span className="text-emerald-400">Kalkan</span>
          </span>
        </Link>
        <div>
          <h2 className="font-display text-4xl font-extrabold leading-tight">
            <span className="text-gradient-gold">{APP_SLOGAN}</span>
          </h2>
          <p className="mt-4 max-w-sm text-navy-100">
            Doğrulanmış ustalar, emanet ödeme ve binlerce iş ilanı — hepsi tek,
            güvenli platformda.
          </p>
        </div>
        <p className="text-xs text-navy-300">
          © {new Date().getFullYear()} İşKalkan · isgarantim.com
        </p>
      </div>

      {/* Sağ form paneli */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 flex items-center gap-2 lg:hidden"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-800 text-gold-400">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-extrabold text-navy-900">
              İş<span className="text-emerald-600">Kalkan</span>
            </span>
          </Link>

          <h1 className="font-display text-2xl font-extrabold text-navy-900">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-sm text-navy-500">{subtitle}</p>}

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-6 text-sm text-navy-500">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
