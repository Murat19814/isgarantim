import Link from "next/link";
import { ArrowLeft, Hammer } from "lucide-react";

export function PanelPlaceholder({
  title,
  description,
  phase,
}: {
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <div>
      <Link
        href="/panel"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-800"
      >
        <ArrowLeft className="h-4 w-4" /> Panele dön
      </Link>
      <div className="card p-8">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
          <Hammer className="h-7 w-7" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-extrabold text-navy-900">
          {title}
        </h1>
        <p className="mt-2 max-w-xl text-navy-500">{description}</p>
        <span className="badge-gold mt-4">{phase}</span>
      </div>
    </div>
  );
}
