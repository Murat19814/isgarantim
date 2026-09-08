"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, Undo2 } from "lucide-react";

export function ComplaintResolve({
  id,
  resolved,
}: {
  id: string;
  resolved: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      await fetch(`/api/admin/complaints/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved: !resolved }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={
        resolved
          ? "inline-flex items-center gap-1 rounded-md border border-navy-200 px-2 py-1 text-xs text-navy-600 hover:bg-navy-50"
          : "inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700"
      }
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : resolved ? <Undo2 className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
      {resolved ? "Geri aç" : "Çözüldü"}
    </button>
  );
}
