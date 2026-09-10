"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Phone } from "lucide-react";

export type CallbackRow = {
  id: string;
  name: string;
  phone: string;
  topic: string | null;
  city: string | null;
  status: string;
  adminNote: string | null;
  createdByName: string | null;
  handledByName: string | null;
  createdAt: string;
};

const STATUSES = ["NEW", "CONTACTED", "DONE", "CANCELLED"];
const STATUS_LABELS: Record<string, string> = {
  NEW: "Yeni",
  CONTACTED: "Arandı",
  DONE: "Tamamlandı",
  CANCELLED: "İptal",
};
const STATUS_CLS: Record<string, string> = {
  NEW: "badge-gold",
  CONTACTED: "badge-emerald",
  DONE: "badge-navy",
  CANCELLED: "badge-navy",
};

export function CallbackManager({ rows }: { rows: CallbackRow[] }) {
  if (rows.length === 0)
    return (
      <div className="card p-8 text-center text-navy-500">
        Henüz &quot;Beni arayın&quot; talebi yok.
      </div>
    );

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <CallbackCard key={r.id} row={r} />
      ))}
    </div>
  );
}

function CallbackCard({ row }: { row: CallbackRow }) {
  const router = useRouter();
  const [status, setStatus] = useState(row.status);
  const [note, setNote] = useState(row.adminNote ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/callback/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote: note || undefined }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-navy-900">{row.name}</span>
            <span className={STATUS_CLS[row.status] ?? "badge-navy"}>
              {STATUS_LABELS[row.status] ?? row.status}
            </span>
          </div>
          <a
            href={`tel:${row.phone}`}
            className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
          >
            <Phone className="h-3.5 w-3.5" /> {row.phone}
          </a>
          <p className="text-xs text-navy-400">
            {row.city ? `${row.city} · ` : ""}
            {row.topic ? `${row.topic} · ` : ""}
            {row.createdByName ? `Üye: ${row.createdByName} · ` : ""}
            {row.createdAt}
            {row.handledByName ? ` · İşleyen: ${row.handledByName}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[160px_1fr_auto] sm:items-end">
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-700">Durum</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-700">Operatör notu (gizli)</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} className="input"
                 placeholder="Görüşme notu..." />
        </div>
        <button onClick={save} disabled={loading} className="btn-primary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? "Kaydedildi ✓" : "Kaydet"}
        </button>
      </div>
    </div>
  );
}
