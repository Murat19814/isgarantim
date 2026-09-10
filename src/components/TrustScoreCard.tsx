import { ShieldCheck, Info } from "lucide-react";

type Factor = { label: string; points: number; max: number };

export function TrustScoreCard({
  score,
  levelLabel,
  factors,
}: {
  score: number;
  levelLabel: string;
  factors: Factor[];
}) {
  const tone = score >= 75 ? "emerald" : score >= 50 ? "gold" : "navy";
  const toneClasses: Record<string, string> = {
    emerald: "text-emerald-600",
    gold: "text-gold-600",
    navy: "text-navy-600",
  };

  return (
    <section className="card p-6">
      <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-navy-900">
        <ShieldCheck className="h-5 w-5 text-emerald-600" /> Güven puanı
      </h2>
      <div className="flex items-end gap-2">
        <span className={`font-display text-4xl font-extrabold ${toneClasses[tone]}`}>{score}</span>
        <span className="pb-1 text-sm text-navy-400">/ 100</span>
        <span className="ml-auto rounded-full bg-navy-800 px-3 py-1 text-xs font-semibold text-gold-400">
          {levelLabel}
        </span>
      </div>

      {/* İlerleme çubuğu */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-navy-100">
        <div
          className={`h-full rounded-full ${score >= 75 ? "bg-emerald-500" : score >= 50 ? "bg-gold-400" : "bg-navy-400"}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Nasıl oluştu */}
      <div className="mt-4 space-y-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-navy-500">
          <Info className="h-3.5 w-3.5" /> Puan nasıl oluşuyor?
        </p>
        {factors.map((f) => (
          <div key={f.label} className="flex items-center gap-2 text-sm">
            <span className="flex-1 text-navy-600">{f.label}</span>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-navy-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${f.max ? (f.points / f.max) * 100 : 0}%` }} />
            </div>
            <span className="w-12 text-right text-xs font-medium text-navy-500">{f.points}/{f.max}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
