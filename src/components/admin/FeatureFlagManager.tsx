"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Flag = {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  price: number;
};

export function FeatureFlagManager({ flags }: { flags: Flag[] }) {
  return (
    <div className="space-y-3">
      {flags.map((f) => (
        <FlagRow key={f.key} flag={f} />
      ))}
    </div>
  );
}

function FlagRow({ flag }: { flag: Flag }) {
  const [enabled, setEnabled] = useState(flag.enabled);
  const [price, setPrice] = useState(String(flag.price ?? 0));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(nextEnabled?: boolean) {
    setSaving(true);
    setSaved(false);
    const en = nextEnabled ?? enabled;
    try {
      const res = await fetch(`/api/admin/feature-flags/${flag.key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: en, price: price ? Number(price) : null }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
    } finally {
      setSaving(false);
    }
  }

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    save(next);
  }

  return (
    <div className={cn("card p-5", enabled && "ring-1 ring-emerald-200")}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-navy-900">{flag.label}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium",
              enabled ? "bg-emerald-100 text-emerald-700" : "bg-navy-100 text-navy-500")}>
              {enabled ? "Açık" : "Kapalı"}
            </span>
            <code className="text-[11px] text-navy-400">{flag.key}</code>
          </div>
          <p className="mt-1 text-sm text-navy-500">{flag.description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={toggle}
          disabled={saving}
          className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors",
            enabled ? "bg-emerald-600" : "bg-navy-200")}
        >
          <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
            enabled ? "translate-x-5" : "translate-x-0.5")} />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <label className="text-sm text-navy-600">Fiyat (₺)</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="input h-9 w-28 py-1"
          placeholder="0"
        />
        <button onClick={() => save()} disabled={saving} className="btn-outline text-sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : "Kaydet"}
        </button>
        {!enabled && <span className="text-xs text-navy-400">Kapalıyken kullanıcıya gösterilmez.</span>}
      </div>
    </div>
  );
}
