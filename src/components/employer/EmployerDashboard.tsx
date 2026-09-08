"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2, Save, Ticket, Check } from "lucide-react";
import { CITIES, JOB_PLANS } from "@/lib/constants";
import { formatTRY } from "@/lib/utils";

type Company = {
  name: string;
  taxNumber: string;
  city: string;
  website: string;
  logoUrl: string;
  about: string;
} | null;

export function EmployerDashboard({
  initialCompany,
  hasCompany,
  remainingQuota,
}: {
  initialCompany: Company;
  hasCompany: boolean;
  remainingQuota: number;
}) {
  const router = useRouter();
  const [company, setCompany] = useState<Company>(
    initialCompany ?? { name: "", taxNumber: "", city: "", website: "", logoUrl: "", about: "" },
  );
  const [editing, setEditing] = useState(!hasCompany);
  const [saving, setSaving] = useState(false);
  const [buying, setBuying] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function set<K extends keyof NonNullable<Company>>(k: K, v: string) {
    setCompany((c) => ({ ...(c as NonNullable<Company>), [k]: v }));
  }

  async function saveCompany() {
    if (!company) return;
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch("/api/companies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...company,
          website: company.website || undefined,
          logoUrl: company.logoUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Kaydedilemedi.");
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setErr("Sunucuya ulaşılamadı.");
    } finally {
      setSaving(false);
    }
  }

  async function buyPlan(planId: string) {
    setBuying(planId);
    setErr(null);
    try {
      const res = await fetch("/api/companies/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Satın alınamadı.");
        return;
      }
      router.refresh();
    } finally {
      setBuying(null);
    }
  }

  return (
    <div className="space-y-6">
      {err && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>
      )}

      {/* Firma kartı */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy-900">
            <Building2 className="h-5 w-5 text-emerald-600" /> Firma bilgileri
          </h2>
          {hasCompany && !editing && (
            <button onClick={() => setEditing(true)} className="btn-outline text-sm">
              Düzenle
            </button>
          )}
        </div>

        {!editing && company ? (
          <div className="text-sm text-navy-700">
            <p className="font-semibold text-navy-900">{company.name}</p>
            {company.city && <p className="text-navy-500">{company.city}</p>}
            {company.about && <p className="mt-2 text-navy-600">{company.about}</p>}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="input" placeholder="Firma adı *" value={company?.name ?? ""} onChange={(e) => set("name", e.target.value)} />
              <input className="input" placeholder="Vergi no" value={company?.taxNumber ?? ""} onChange={(e) => set("taxNumber", e.target.value)} />
              <select className="input" value={company?.city ?? ""} onChange={(e) => set("city", e.target.value)}>
                <option value="">Şehir</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input className="input" placeholder="Web sitesi (https://...)" value={company?.website ?? ""} onChange={(e) => set("website", e.target.value)} />
              <input className="input sm:col-span-2" placeholder="Logo URL (https://...)" value={company?.logoUrl ?? ""} onChange={(e) => set("logoUrl", e.target.value)} />
            </div>
            <textarea className="input resize-none" rows={3} placeholder="Firma hakkında" value={company?.about ?? ""} onChange={(e) => set("about", e.target.value)} />
            <button onClick={saveCompany} disabled={saving || !company?.name} className="btn-primary">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Kaydet
            </button>
          </div>
        )}
      </div>

      {/* İlan hakkı + planlar */}
      {hasCompany && (
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy-900">
              <Ticket className="h-5 w-5 text-gold-500" /> İlan hakkı
            </h2>
            <span className="badge-emerald">Kalan: {remainingQuota}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {JOB_PLANS.map((p) => (
              <div key={p.id} className="rounded-xl border border-navy-100 p-4">
                <p className="font-semibold text-navy-900">{p.name}</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-navy-900">
                  {formatTRY(p.price)}
                </p>
                <p className="mt-1 text-xs text-navy-500">{p.desc}</p>
                <button
                  onClick={() => buyPlan(p.id)}
                  disabled={buying !== null}
                  className="btn-outline mt-3 w-full text-sm"
                >
                  {buying === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Satın al
                </button>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-navy-400">
            Test modu — gerçek ödeme entegrasyonu sonra bağlanacak.
          </p>
        </div>
      )}
    </div>
  );
}
