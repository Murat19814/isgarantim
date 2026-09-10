"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star, EyeOff, Eye } from "lucide-react";

export type ReportedReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  reportReason: string | null;
  isHidden: boolean;
  createdAt: string;
  authorName: string;
  targetName: string;
};

export function ReviewModerator({ rows }: { rows: ReportedReviewRow[] }) {
  if (rows.length === 0)
    return <div className="card p-8 text-center text-navy-500">Şikayet edilen yorum yok.</div>;

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <Row key={r.id} row={r} />
      ))}
    </div>
  );
}

function Row({ row }: { row: ReportedReviewRow }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function setHidden(hidden: boolean) {
    setLoading(hidden ? "hide" : "show");
    try {
      const res = await fetch(`/api/admin/reviews/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 font-semibold text-navy-900">
          <Star className="h-4 w-4 fill-gold-400 text-gold-400" /> {row.rating}/5
        </span>
        <span className="text-xs text-navy-400">
          {row.authorName} → {row.targetName} · {row.createdAt}
        </span>
        {row.isHidden && <span className="badge-navy">Gizli</span>}
      </div>
      {row.comment && (
        <p className="mt-2 whitespace-pre-line rounded-lg bg-navy-50/50 p-3 text-sm text-navy-700">
          {row.comment}
        </p>
      )}
      {row.reportReason && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          Şikayet nedeni: {row.reportReason}
        </p>
      )}
      <div className="mt-3 flex gap-2">
        {row.isHidden ? (
          <button onClick={() => setHidden(false)} disabled={loading !== null} className="btn-outline text-sm">
            {loading === "show" ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><Eye className="h-4 w-4" /> Göster</>)}
          </button>
        ) : (
          <button onClick={() => setHidden(true)} disabled={loading !== null}
            className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            {loading === "hide" ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><EyeOff className="h-4 w-4" /> Gizle ve kapat</>)}
          </button>
        )}
      </div>
    </div>
  );
}
