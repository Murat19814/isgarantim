"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ExternalLink, ShieldAlert } from "lucide-react";
import { PROBLEM_LABELS, PROBLEM_STATUS_LABELS } from "@/lib/problems";

export type ProblemRow = {
  id: string;
  type: string;
  status: string;
  description: string;
  media: string[];
  adminNote: string | null;
  createdAt: string;
  reporterName: string;
  reporterEmail: string;
  requestId: string;
  requestTitle: string;
  city: string;
};

const STATUSES = ["OPEN", "UNDER_REVIEW", "RESOLVED", "CLOSED"];

const STATUS_CLS: Record<string, string> = {
  OPEN: "badge-gold",
  UNDER_REVIEW: "badge-emerald",
  RESOLVED: "badge-navy",
  CLOSED: "badge-navy",
};

export function ProblemManager({ reports }: { reports: ProblemRow[] }) {
  if (reports.length === 0)
    return (
      <div className="card p-8 text-center text-navy-500">
        Henüz sorun bildirimi yok.
      </div>
    );

  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <ProblemCard key={r.id} row={r} />
      ))}
    </div>
  );
}

function ProblemCard({ row }: { row: ProblemRow }) {
  const router = useRouter();
  const [status, setStatus] = useState(row.status);
  const [note, setNote] = useState(row.adminNote ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/problems/${row.id}`, {
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
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
              <ShieldAlert className="h-3.5 w-3.5" /> {PROBLEM_LABELS[row.type] ?? row.type}
            </span>
            <span className={STATUS_CLS[row.status] ?? "badge-navy"}>
              {PROBLEM_STATUS_LABELS[row.status] ?? row.status}
            </span>
          </div>
          <Link
            href={`/panel/hizmet-al/${row.requestId}`}
            className="mt-2 inline-flex items-center gap-1 font-semibold text-navy-900 hover:text-emerald-700"
          >
            {row.requestTitle} <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <p className="text-xs text-navy-400">
            {row.city} · Bildiren: {row.reporterName} ({row.reporterEmail}) · {row.createdAt}
          </p>
        </div>
      </div>

      <p className="mt-3 whitespace-pre-line rounded-xl bg-navy-50/50 p-3 text-sm text-navy-700">
        {row.description}
      </p>

      {row.media.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {row.media.map((m, i) => (
            <a key={i} href={m} target="_blank" rel="noreferrer"
               className="rounded-lg bg-white px-2 py-1 text-xs text-emerald-700 underline">
              Kanıt {i + 1}
            </a>
          ))}
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-[160px_1fr_auto] sm:items-end">
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-700">Durum</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
            {STATUSES.map((s) => (
              <option key={s} value={s}>{PROBLEM_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-700">Admin notu (gizli)</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} className="input"
                 placeholder="İç değerlendirme notu..." />
        </div>
        <button onClick={save} disabled={loading} className="btn-primary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? "Kaydedildi ✓" : "Kaydet"}
        </button>
      </div>
    </div>
  );
}
