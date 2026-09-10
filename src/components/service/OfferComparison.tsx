"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star, ShieldCheck, CheckCircle2, Clock, Loader2, Trophy, MessageSquare,
  Package, Search, CalendarClock,
} from "lucide-react";
import { cn, formatTRY } from "@/lib/utils";
import { VerificationBadges } from "@/components/VerificationBadges";

type Offer = {
  id: string;
  price: number;
  estimatedDuration: string | null;
  message: string | null;
  availability: string | null;
  materialsIncluded: boolean | null;
  onSiteInspection: boolean | null;
  status: string;
  provider: {
    id: string;
    fullName: string;
    emailVerified: Date | string | null;
    phoneVerified: Date | string | null;
    verifications: { type: string }[];
    providerProfile: {
      ratingAvg: number;
      ratingCount: number;
      completedJobs: number;
      identityVerified: boolean;
      skillVerified: boolean;
      avgResponseMin: number | null;
      headline: string | null;
    } | null;
  };
};

function computeBadges(p: Offer["provider"]): Record<string, boolean> {
  const approved = new Set(p.verifications.map((v) => v.type));
  return {
    PHONE: !!p.phoneVerified,
    EMAIL: !!p.emailVerified,
    IDENTITY: approved.has("IDENTITY"),
    ADDRESS: approved.has("ADDRESS"),
    PROFESSIONAL: approved.has("PROFESSIONAL"),
    COMPANY: approved.has("COMPANY"),
    REFERENCE: approved.has("REFERENCE"),
  };
}

export function OfferComparison({
  requestId,
  offers,
  selectable,
}: {
  requestId: string;
  offers: Offer[];
  selectable: boolean;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function select(offerId: string) {
    if (!confirm("Bu hizmet vereni seçmek istediğine emin misin? Ardından randevu oluşturabilirsin.")) return;
    setLoadingId(offerId);
    setError(null);
    try {
      const res = await fetch(`/api/service-requests/${requestId}/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Seçim yapılamadı.");
        return;
      }
      router.refresh();
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoadingId(null);
    }
  }

  if (offers.length === 0) {
    return (
      <div className="card p-8 text-center text-navy-500">
        Henüz teklif gelmedi. Hizmet verenler talebini görünce teklif verecek.
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {offers.map((o) => {
          const p = o.provider.providerProfile;
          const badges = computeBadges(o.provider);
          const won = o.status === "WON";
          const lost = o.status === "LOST";
          return (
            <div
              key={o.id}
              className={cn(
                "card p-5",
                won && "border-emerald-400 ring-2 ring-emerald-200",
                lost && "opacity-60",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-navy-800 font-display text-sm font-bold text-gold-400">
                    {o.provider.fullName.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/hizmet-veren/${o.provider.id}`}
                        target="_blank"
                        className="font-semibold text-navy-900 hover:text-emerald-700 hover:underline"
                      >
                        {o.provider.fullName}
                      </Link>
                      {p?.identityVerified && (
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-xs text-navy-400">{p?.headline ?? "Hizmet Veren"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-extrabold text-navy-900">
                    {formatTRY(o.price)}
                  </p>
                  {won && (
                    <span className="badge-emerald mt-1">
                      <Trophy className="h-3 w-3" /> Seçildi
                    </span>
                  )}
                </div>
              </div>

              {/* Doğrulama rozetleri (belge içeriği gösterilmez) */}
              <div className="mt-3">
                <VerificationBadges badges={badges} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Stat
                  icon={<Star className="h-4 w-4 fill-gold-400 text-gold-400" />}
                  label="Puan"
                  value={p && p.ratingCount > 0 ? `${p.ratingAvg.toFixed(1)} (${p.ratingCount})` : "Yeni"}
                />
                <Stat
                  icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  label="Tamamlanan"
                  value={`${p?.completedJobs ?? 0} iş`}
                />
                <Stat
                  icon={<Clock className="h-4 w-4 text-navy-400" />}
                  label="Tahmini süre"
                  value={o.estimatedDuration ?? "—"}
                />
                <Stat
                  icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />}
                  label="Doğrulama"
                  value={
                    p?.skillVerified
                      ? "Beceri ✓"
                      : p?.identityVerified
                        ? "Kimlik ✓"
                        : "—"
                  }
                />
              </div>

              {/* Teklif detayları */}
              {(o.availability || o.materialsIncluded || o.onSiteInspection) && (
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {o.availability && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-navy-50 px-2 py-0.5 text-navy-600">
                      <CalendarClock className="h-3.5 w-3.5" /> {o.availability}
                    </span>
                  )}
                  {o.materialsIncluded && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                      <Package className="h-3.5 w-3.5" /> Malzeme dahil
                    </span>
                  )}
                  {o.onSiteInspection && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-2 py-0.5 text-gold-600">
                      <Search className="h-3.5 w-3.5" /> Yerinde keşif
                    </span>
                  )}
                </div>
              )}

              {o.message && (
                <p className="mt-4 flex gap-2 rounded-xl bg-navy-50 p-3 text-sm text-navy-600">
                  <MessageSquare className="h-4 w-4 shrink-0 text-navy-400" />
                  {o.message}
                </p>
              )}

              {selectable && (
                <button
                  onClick={() => select(o.id)}
                  disabled={loadingId !== null}
                  className="btn-primary mt-4 w-full"
                >
                  {loadingId === o.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Bu hizmet vereni seç"
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div className="min-w-0">
        <p className="text-xs text-navy-400">{label}</p>
        <p className="truncate font-medium text-navy-800">{value}</p>
      </div>
    </div>
  );
}
