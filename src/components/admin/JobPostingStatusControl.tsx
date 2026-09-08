"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const OPTIONS = [
  { value: "ACTIVE", label: "Yayında" },
  { value: "PAUSED", label: "Duraklat" },
  { value: "CLOSED", label: "Kapat" },
  { value: "EXPIRED", label: "Süresi doldu" },
];

export function JobPostingStatusControl({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function change(newStatus: string) {
    if (newStatus === status) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/job-postings/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-1">
      {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-navy-400" />}
      <select
        value={status}
        onChange={(e) => change(e.target.value)}
        disabled={busy}
        className="rounded-md border border-navy-200 px-2 py-1 text-xs"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
        {!OPTIONS.some((o) => o.value === status) && <option value={status}>{status}</option>}
      </select>
    </span>
  );
}
