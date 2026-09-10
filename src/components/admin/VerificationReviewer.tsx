"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, FileText, CheckCircle2, XCircle } from "lucide-react";
import { BADGE_LABELS, VERIFICATION_STATUS_LABELS } from "@/lib/badges";

export type VerificationRow = {
  id: string;
  type: string;
  status: string;
  documentUrl: string | null;
  note: string | null;
  adminNote: string | null;
  createdAt: string;
  userName: string;
  userEmail: string;
};

const STATUS_CLS: Record<string, string> = {
  PENDING: "badge-gold",
  APPROVED: "badge-emerald",
  REJECTED: "badge-navy",
};

export function VerificationReviewer({ rows }: { rows: VerificationRow[] }) {
  if (rows.length === 0)
    return <div className="card p-8 text-center text-navy-500">Doğrulama başvurusu yok.</div>;

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <ReviewCard key={r.id} row={r} />
      ))}
    </div>
  );
}

function ReviewCard({ row }: { row: VerificationRow }) {
  const router = useRouter();
  const [note, setNote] = useState(row.adminNote ?? "");
  const [loading, setLoading] = useState<string | null>(null);

  async function review(status: "APPROVED" | "REJECTED") {
    setLoading(status);
    try {
      const res = await fetch(`/api/admin/verifications/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote: note || undefined }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-navy-900">{BADGE_LABELS[row.type] ?? row.type}</span>
            <span className={STATUS_CLS[row.status] ?? "badge-navy"}>
              {VERIFICATION_STATUS_LABELS[row.status] ?? row.status}
            </span>
          </div>
          <p className="text-xs text-navy-400">
            {row.userName} ({row.userEmail}) · {row.createdAt}
          </p>
        </div>
        {row.documentUrl && (
          <a href={row.documentUrl} target="_blank" rel="noreferrer"
             className="inline-flex items-center gap-1 rounded-lg bg-navy-50 px-3 py-1.5 text-sm text-navy-700 hover:bg-navy-100">
            <FileText className="h-4 w-4" /> Belgeyi gör
          </a>
        )}
      </div>

      {row.note && (
        <p className="mt-2 rounded-lg bg-navy-50/50 px-3 py-2 text-sm text-navy-600">
          Kullanıcı notu: {row.note}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-end gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="input flex-1"
          placeholder="Admin notu (red durumunda kullanıcı görür)..."
        />
        <button onClick={() => review("APPROVED")} disabled={loading !== null}
          className="btn-primary">
          {loading === "APPROVED" ? <Loader2 className="h-4 w-4 animate-spin" /> : (
            <><CheckCircle2 className="h-4 w-4" /> Onayla</>
          )}
        </button>
        <button onClick={() => review("REJECTED")} disabled={loading !== null}
          className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
          {loading === "REJECTED" ? <Loader2 className="h-4 w-4 animate-spin" /> : (
            <><XCircle className="h-4 w-4" /> Reddet</>
          )}
        </button>
      </div>
    </div>
  );
}
