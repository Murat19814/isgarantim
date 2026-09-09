import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Yasal/kurumsal sayfalar için ortak düzen. */
export function LegalShell({
  title,
  subtitle,
  updated,
  children,
}: {
  title: string;
  subtitle?: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-navy-50/40">
      <div className="container-page py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-800"
          >
            <ArrowLeft className="h-4 w-4" /> Ana sayfa
          </Link>

          <h1 className="font-display text-3xl font-extrabold text-navy-900 sm:text-4xl">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-navy-500">{subtitle}</p>}
          {updated && (
            <p className="mt-2 text-xs text-navy-400">Son güncelleme: {updated}</p>
          )}

          <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-navy-700">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Başlıklı bölüm. */
export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-lg font-bold text-navy-900">{title}</h2>
      {children}
    </section>
  );
}

/** Madde listesi. */
export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 marker:text-emerald-500">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
