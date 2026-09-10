"use client";

import { useState } from "react";
import { Copy, Check, Gift, Award, Users, CheckCircle2, Clock, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Invitee = { fullName: string; joinedAt: string; verified: boolean };
type Tier = { min: number; label: string; founder: boolean };

export function ReferralPanel({
  code, validCount, totalInvited, isFounder, tierLabel, nextLabel, nextMin, tiers, invitees,
}: {
  code: string;
  validCount: number;
  totalInvited: number;
  isFounder: boolean;
  tierLabel: string | null;
  nextLabel: string | null;
  nextMin: number | null;
  tiers: Tier[];
  invitees: Invitee[];
}) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = `${origin}/kayit?ref=${code}`;

  async function copy(text: string, which: "code" | "link") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* yoksay */
    }
  }

  async function share() {
    if (navigator.share) {
      await navigator.share({
        title: "İşKalkan'a katıl",
        text: "İşKalkan'da hizmet al, hizmet ver — ilk yıl her şey ücretsiz!",
        url: link,
      }).catch(() => {});
    } else {
      copy(link, "link");
    }
  }

  const remaining = nextMin != null ? Math.max(0, nextMin - validCount) : 0;

  return (
    <div className="mt-6 space-y-6">
      {/* Kod + link */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">Davet kodun</p>
            <p className="font-display text-2xl font-extrabold tracking-widest text-navy-900">{code}</p>
          </div>
          {isFounder && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-3 py-1 text-sm font-semibold text-gold-700">
              <Award className="h-4 w-4" /> Kurucu Üye
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-navy-200 px-3 py-2 text-sm text-navy-600">
            <span className="truncate">{link}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => copy(link, "link")} className="btn-outline text-sm">
              {copied === "link" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied === "link" ? "Kopyalandı" : "Linki kopyala"}
            </button>
            <button onClick={share} className="btn-primary text-sm">
              <Share2 className="h-4 w-4" /> Paylaş
            </button>
          </div>
        </div>
      </div>

      {/* İstatistik */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat icon={<Users className="h-5 w-5 text-emerald-600" />} value={totalInvited} label="Toplam davet" />
        <Stat icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />} value={validCount} label="Doğrulanan" />
        <Stat icon={<Gift className="h-5 w-5 text-gold-500" />} value={tierLabel ?? "—"} label="Unvanın" />
      </div>

      {/* İlerleme */}
      {nextLabel && nextMin != null && (
        <div className="card p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-navy-800">Sıradaki: {nextLabel}</span>
            <span className="text-navy-400">{validCount}/{nextMin}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-navy-100">
            <div className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.min(100, (validCount / nextMin) * 100)}%` }} />
          </div>
          <p className="mt-2 text-xs text-navy-500">
            {remaining > 0 ? `${remaining} doğrulanmış davet daha!` : "Ödülü kazandın 🎉"}
          </p>
        </div>
      )}

      {/* Kademeler */}
      <div className="card p-5">
        <h2 className="mb-3 font-display text-lg font-bold text-navy-900">Ödül kademeleri</h2>
        <div className="space-y-2">
          {tiers.map((t) => {
            const reached = validCount >= t.min;
            return (
              <div key={t.min} className={cn("flex items-center justify-between rounded-xl px-3 py-2 text-sm",
                reached ? "bg-emerald-50" : "bg-navy-50/50")}>
                <span className="flex items-center gap-2">
                  {t.founder ? <Award className="h-4 w-4 text-gold-500" /> : <Gift className="h-4 w-4 text-emerald-600" />}
                  <span className="font-medium text-navy-800">{t.label}</span>
                  {t.founder && <span className="text-xs text-gold-600">Kurucu Üye</span>}
                </span>
                <span className={cn("text-xs", reached ? "font-semibold text-emerald-700" : "text-navy-400")}>
                  {reached ? "Kazanıldı ✓" : `${t.min} davet`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Davet edilenler */}
      {invitees.length > 0 && (
        <div className="card p-5">
          <h2 className="mb-3 font-display text-lg font-bold text-navy-900">Davet ettiklerin</h2>
          <div className="space-y-1">
            {invitees.map((i, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-navy-50 py-2 text-sm last:border-0">
                <span className="text-navy-800">{i.fullName}</span>
                <span className={cn("inline-flex items-center gap-1 text-xs",
                  i.verified ? "text-emerald-600" : "text-navy-400")}>
                  {i.verified ? (<><CheckCircle2 className="h-3.5 w-3.5" /> Doğrulandı</>) : (<><Clock className="h-3.5 w-3.5" /> Bekliyor</>)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="card p-4 text-center">
      <div className="flex justify-center">{icon}</div>
      <p className="mt-1 font-display text-xl font-extrabold text-navy-900">{value}</p>
      <p className="text-xs text-navy-400">{label}</p>
    </div>
  );
}
