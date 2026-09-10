"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileSignature, Loader2, CheckCircle2, Package } from "lucide-react";
import { formatTRY } from "@/lib/utils";

export type AgreementData = {
  scope: string;
  price: number;
  materialsIncluded: boolean;
  startDate: string | null;
  endDate: string | null;
  cancellationTerms: string | null;
  customerNote: string | null;
  providerNote: string | null;
  customerApproved: boolean;
  providerApproved: boolean;
} | null;

export function WorkAgreementPanel({
  requestId,
  role,
  defaultPrice,
  agreement,
}: {
  requestId: string;
  role: "customer" | "provider";
  defaultPrice: number;
  agreement: AgreementData;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(!agreement);
  const [scope, setScope] = useState(agreement?.scope ?? "");
  const [price, setPrice] = useState(String(agreement?.price ?? defaultPrice ?? ""));
  const [materials, setMaterials] = useState(agreement?.materialsIncluded ?? false);
  const [startDate, setStartDate] = useState(agreement?.startDate?.slice(0, 10) ?? "");
  const [endDate, setEndDate] = useState(agreement?.endDate?.slice(0, 10) ?? "");
  const [cancellationTerms, setCancellationTerms] = useState(agreement?.cancellationTerms ?? "");
  const [note, setNote] = useState(
    role === "customer" ? agreement?.customerNote ?? "" : agreement?.providerNote ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const myApproved = agreement
    ? role === "customer"
      ? agreement.customerApproved
      : agreement.providerApproved
    : false;
  const otherApproved = agreement
    ? role === "customer"
      ? agreement.providerApproved
      : agreement.customerApproved
    : false;
  const bothApproved = !!agreement && agreement.customerApproved && agreement.providerApproved;

  async function save() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/service-requests/${requestId}/agreement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope,
          price: Number(price),
          materialsIncluded: materials,
          startDate: startDate ? new Date(startDate).toISOString() : undefined,
          endDate: endDate ? new Date(endDate).toISOString() : undefined,
          cancellationTerms: cancellationTerms || undefined,
          customerNote: role === "customer" ? note || undefined : undefined,
          providerNote: role === "provider" ? note || undefined : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kaydedilemedi.");
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function approve() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/service-requests/${requestId}/agreement`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Onaylanamadı.");
        return;
      }
      router.refresh();
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy-900">
        <FileSignature className="h-5 w-5 text-emerald-600" /> Dijital iş anlaşması
      </h2>
      <p className="mt-1 text-xs text-navy-500">
        Ödeme platformdan geçmese de taraflar iş kapsamı ve şartları üzerinde anlaşır.
        Böylece sonradan anlaşmazlık azalır.
      </p>

      {error && <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {editing ? (
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-navy-700">Yapılacak iş (kapsam)</label>
            <textarea value={scope} onChange={(e) => setScope(e.target.value)} rows={3} className="input resize-none"
              placeholder="Ör. Salon ve iki oda boyası, tavan dahil, iki kat..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-navy-700">Kararlaştırılan fiyat (₺)</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="input" />
            </div>
            <label className="mt-6 inline-flex items-center gap-2 text-sm text-navy-700">
              <input type="checkbox" checked={materials} onChange={(e) => setMaterials(e.target.checked)}
                className="h-4 w-4 rounded border-navy-300 text-emerald-600" />
              Malzeme dahil
            </label>
            <div>
              <label className="mb-1 block text-xs font-medium text-navy-700">Başlangıç</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-navy-700">Bitiş</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-navy-700">İptal şartları (opsiyonel)</label>
            <textarea value={cancellationTerms} onChange={(e) => setCancellationTerms(e.target.value)} rows={2} className="input resize-none"
              placeholder="Ör. 24 saat öncesine kadar ücretsiz iptal." />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-navy-700">Ek not (opsiyonel)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="input resize-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={loading || scope.length < 10 || !price} className="btn-primary">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {agreement ? "Güncelle ve onayla" : "Anlaşma oluştur ve onayla"}
            </button>
            {agreement && (
              <button onClick={() => setEditing(false)} className="btn-ghost">Vazgeç</button>
            )}
          </div>
        </div>
      ) : agreement ? (
        <div className="mt-4 space-y-3 text-sm">
          <Row label="Kapsam" value={agreement.scope} />
          <div className="flex flex-wrap gap-4">
            <Row label="Fiyat" value={formatTRY(agreement.price)} inline />
            <span className="inline-flex items-center gap-1 text-navy-700">
              <Package className="h-4 w-4 text-navy-400" />
              {agreement.materialsIncluded ? "Malzeme dahil" : "Malzeme hariç"}
            </span>
          </div>
          {(agreement.startDate || agreement.endDate) && (
            <Row label="Tarih" value={`${agreement.startDate?.slice(0, 10) ?? "?"} → ${agreement.endDate?.slice(0, 10) ?? "?"}`} inline />
          )}
          {agreement.cancellationTerms && <Row label="İptal şartları" value={agreement.cancellationTerms} />}
          {agreement.customerNote && <Row label="Müşteri notu" value={agreement.customerNote} />}
          {agreement.providerNote && <Row label="Hizmet veren notu" value={agreement.providerNote} />}

          <div className="flex flex-wrap gap-3 pt-2">
            <ApprovalChip label="Müşteri" ok={agreement.customerApproved} />
            <ApprovalChip label="Hizmet veren" ok={agreement.providerApproved} />
          </div>

          {bothApproved ? (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 font-medium text-emerald-700">
              <CheckCircle2 className="h-5 w-5" /> Anlaşma iki tarafça onaylandı.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {!myApproved && (
                <button onClick={approve} disabled={loading} className="btn-primary">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />} Onayla
                </button>
              )}
              <button onClick={() => setEditing(true)} className="btn-outline">Düzenle</button>
              {myApproved && !otherApproved && (
                <span className="inline-flex items-center text-sm text-navy-500">Karşı tarafın onayı bekleniyor…</span>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Row({ label, value, inline }: { label: string; value: string; inline?: boolean }) {
  if (inline) {
    return (
      <span className="text-navy-700">
        <span className="text-navy-400">{label}:</span> <span className="font-semibold">{value}</span>
      </span>
    );
  }
  return (
    <div>
      <p className="text-xs text-navy-400">{label}</p>
      <p className="whitespace-pre-line text-navy-800">{value}</p>
    </div>
  );
}

function ApprovalChip({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${ok ? "bg-emerald-50 text-emerald-700" : "bg-navy-50 text-navy-500"}`}>
      <CheckCircle2 className="h-3.5 w-3.5" /> {label} {ok ? "onayladı" : "bekliyor"}
    </span>
  );
}
