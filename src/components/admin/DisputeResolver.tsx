"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gavel, Loader2, Undo2, Send, User, Wrench } from "lucide-react";
import { formatTRY } from "@/lib/utils";

export type DisputeRow = {
  id: string;
  status: string;
  reason: string;
  createdAt: string;
  resolutionNote: string | null;
  requestId: string;
  requestTitle: string;
  city: string;
  customerName: string;
  amount: number;
  paymentStatus: string;
};

const STATUS_TR: Record<string, { label: string; cls: string }> = {
  OPEN: { label: "Açık", cls: "bg-red-50 text-red-600" },
  UNDER_REVIEW: { label: "İncelemede", cls: "bg-gold-50 text-gold-600" },
  RESOLVED_CUSTOMER: { label: "Müşteri lehine", cls: "bg-emerald-50 text-emerald-700" },
  RESOLVED_PROVIDER: { label: "Hizmet veren lehine", cls: "bg-emerald-50 text-emerald-700" },
  CLOSED: { label: "Kapandı", cls: "bg-navy-100 text-navy-600" },
};

export function DisputeResolver({ disputes }: { disputes: DisputeRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function resolve(id: string, inFavorOf: "CUSTOMER" | "PROVIDER") {
    const note = window.prompt("Çözüm notu (opsiyonel):") ?? undefined;
    setBusy(id + inFavorOf);
    try {
      await fetch(`/api/admin/disputes/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inFavorOf, note }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  if (disputes.length === 0) {
    return <div className="card p-8 text-center text-navy-500">Şu an itiraz yok. 🎉</div>;
  }

  return (
    <div className="space-y-3">
      {disputes.map((d) => {
        const st = STATUS_TR[d.status] ?? { label: d.status, cls: "bg-navy-100 text-navy-600" };
        const open = d.status === "OPEN" || d.status === "UNDER_REVIEW";
        return (
          <div key={d.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 text-red-600">
                  <Gavel className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold text-navy-900">{d.requestTitle}</p>
                  <p className="text-xs text-navy-400">
                    {d.city} · Müşteri: {d.customerName} · {d.createdAt}
                  </p>
                </div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs ${st.cls}`}>{st.label}</span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
              <span className="text-navy-600">
                Emanet tutar: <b className="text-navy-900">{formatTRY(d.amount)}</b>
              </span>
              <span className="text-navy-400">Ödeme durumu: {d.paymentStatus}</span>
            </div>

            <p className="mt-2 rounded-xl bg-navy-50/50 p-3 text-sm text-navy-700">
              <span className="font-medium">İtiraz nedeni:</span> {d.reason}
            </p>

            {d.resolutionNote && (
              <p className="mt-2 text-sm text-navy-500">Çözüm notu: {d.resolutionNote}</p>
            )}

            {open && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => resolve(d.id, "CUSTOMER")}
                  disabled={busy !== null}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 px-3 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50"
                >
                  {busy === d.id + "CUSTOMER" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Undo2 className="h-4 w-4" />}
                  <User className="h-4 w-4" /> Müşteri lehine (iade)
                </button>
                <button
                  onClick={() => resolve(d.id, "PROVIDER")}
                  disabled={busy !== null}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  {busy === d.id + "PROVIDER" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <Wrench className="h-4 w-4" /> Hizmet veren lehine (aktar)
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
