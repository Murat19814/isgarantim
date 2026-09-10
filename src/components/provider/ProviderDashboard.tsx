"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, MapPin, Users, X, Gift, Pencil, CheckCircle2 } from "lucide-react";
import { formatTRY } from "@/lib/utils";
import { MAX_OFFERS_PER_REQUEST } from "@/lib/constants";

type MyOffer = {
  price: number;
  estimatedDuration: string;
  message: string;
  availability: string;
  materialsIncluded: boolean;
  onSiteInspection: boolean;
  status: string;
};

type OpenRequest = {
  id: string;
  title: string;
  city: string;
  district: string | null;
  categoryName: string;
  offerCount: number;
  budgetMin: number | null;
  budgetMax: number | null;
  myOffer: MyOffer | null;
};

export function ProviderDashboard({ requests }: { requests: OpenRequest[] }) {
  const router = useRouter();
  const [offerFor, setOfferFor] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* 1. yıl ücretsiz banner */}
      <div className="flex items-start gap-3 rounded-2xl bg-emerald-600 p-5 text-white">
        <Gift className="mt-0.5 h-6 w-6 shrink-0 text-gold-300" />
        <div>
          <p className="font-display text-lg font-bold">1 yıl boyunca teklif vermek ücretsiz 🎉</p>
          <p className="mt-1 text-sm text-emerald-50">
            Kontör yok, komisyon yok, teklif ücreti yok. Talebe teklifini ver, işi al, kazancın senin olsun.
          </p>
        </div>
      </div>

      {/* Açık talepler */}
      <div>
        <h2 className="mb-4 font-display text-xl font-bold text-navy-900">
          Açık hizmet talepleri ({requests.length})
        </h2>
        {requests.length === 0 ? (
          <div className="card p-8 text-center text-navy-500">
            Şu an açık talep yok. Yeni talepler geldiğinde burada görünecek.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => {
              const full = !r.myOffer && r.offerCount >= MAX_OFFERS_PER_REQUEST;
              const open = offerFor === r.id;
              return (
                <div key={r.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="badge-navy">{r.categoryName}</span>
                      <p className="mt-1 truncate font-semibold text-navy-900">{r.title}</p>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-400">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {r.city}
                          {r.district ? ` / ${r.district}` : ""}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> {r.offerCount}/{MAX_OFFERS_PER_REQUEST} teklif
                        </span>
                        {(r.budgetMin || r.budgetMax) && (
                          <span className="inline-flex items-center gap-1">
                            {r.budgetMin ? formatTRY(r.budgetMin) : "?"} -{" "}
                            {r.budgetMax ? formatTRY(r.budgetMax) : "?"}
                          </span>
                        )}
                      </div>
                      {r.myOffer && (
                        <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Teklifin: {formatTRY(r.myOffer.price)}
                          {r.myOffer.estimatedDuration ? ` · ${r.myOffer.estimatedDuration}` : ""}
                        </p>
                      )}
                    </div>

                    {full ? (
                      <span className="badge-gold shrink-0">Teklif doldu</span>
                    ) : (
                      <button
                        onClick={() => setOfferFor(open ? null : r.id)}
                        className={r.myOffer ? "btn-outline shrink-0 text-sm" : "btn-primary shrink-0 text-sm"}
                      >
                        {open ? (
                          <><X className="h-4 w-4" /> Kapat</>
                        ) : r.myOffer ? (
                          <><Pencil className="h-4 w-4" /> Teklifi güncelle</>
                        ) : (
                          <><Plus className="h-4 w-4" /> Teklif ver</>
                        )}
                      </button>
                    )}
                  </div>

                  {open && !full && (
                    <OfferForm
                      requestId={r.id}
                      existing={r.myOffer}
                      onSuccess={() => {
                        setOfferFor(null);
                        router.refresh();
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function OfferForm({
  requestId,
  existing,
  onSuccess,
}: {
  requestId: string;
  existing: MyOffer | null;
  onSuccess: () => void;
}) {
  const [price, setPrice] = useState(existing ? String(existing.price) : "");
  const [duration, setDuration] = useState(existing?.estimatedDuration ?? "");
  const [message, setMessage] = useState(existing?.message ?? "");
  const [availability, setAvailability] = useState(existing?.availability ?? "");
  const [materials, setMaterials] = useState(existing?.materialsIncluded ?? false);
  const [inspection, setInspection] = useState(existing?.onSiteInspection ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/service-requests/${requestId}/offers`, {
        method: existing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: Number(price),
          estimatedDuration: duration,
          message: message || undefined,
          availability: availability || undefined,
          materialsIncluded: materials,
          onSiteInspection: inspection,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Teklif kaydedilemedi.");
        return;
      }
      onSuccess();
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-navy-100 bg-navy-50/50 p-4">
      {error && (
        <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-700">Fiyatın (₺)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="input" placeholder="2500" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-700">Tahmini süre</label>
          <input value={duration} onChange={(e) => setDuration(e.target.value)} className="input" placeholder="2 gün" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-navy-700">Müsaitlik</label>
          <input value={availability} onChange={(e) => setAvailability(e.target.value)} className="input" placeholder="Yarın 14:00 / Hafta içi" />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-4">
        <label className="inline-flex items-center gap-2 text-sm text-navy-700">
          <input type="checkbox" checked={materials} onChange={(e) => setMaterials(e.target.checked)} className="h-4 w-4 rounded border-navy-300 text-emerald-600" />
          Malzeme fiyata dahil
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-navy-700">
          <input type="checkbox" checked={inspection} onChange={(e) => setInspection(e.target.checked)} className="h-4 w-4 rounded border-navy-300 text-emerald-600" />
          Yerinde keşif gerekli
        </label>
      </div>
      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-navy-700">Açıklama (opsiyonel)</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} className="input resize-none" placeholder="Deneyimini ve işe yaklaşımını kısaca yaz..." />
      </div>
      <button onClick={submit} disabled={loading || !price || !duration} className="btn-primary mt-3 w-full">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {existing ? "Teklifi güncelle" : "Teklifi gönder (ücretsiz)"}
      </button>
    </div>
  );
}
