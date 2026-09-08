"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Tags } from "lucide-react";
import { cn } from "@/lib/utils";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  count: number;
};

function Panel({
  kind, title, note, items,
}: {
  kind: "service" | "job";
  title: string;
  note: string;
  items: CategoryRow[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function add() {
    if (name.trim().length < 2) return;
    setAdding(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Eklenemedi.");
        return;
      }
      setName("");
      router.refresh();
    } finally {
      setAdding(false);
    }
  }

  async function toggle(id: string, isActive: boolean) {
    setBusy(id);
    try {
      await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, id, isActive }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="card p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy-900">
        <Tags className="h-5 w-5 text-emerald-600" /> {title}
      </h2>
      <p className="mt-1 text-xs text-navy-500">{note}</p>

      <div className="mt-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Yeni kategori adı"
          className="input"
        />
        <button onClick={add} disabled={adding || name.trim().length < 2} className="btn-primary shrink-0 text-sm">
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Ekle
        </button>
      </div>
      {err && <p className="mt-2 text-xs text-red-600">{err}</p>}

      <div className="mt-4 divide-y divide-navy-50">
        {items.map((c) => (
          <div key={c.id} className="flex items-center justify-between py-2.5">
            <div>
              <p className={cn("text-sm font-medium", c.isActive ? "text-navy-900" : "text-navy-400 line-through")}>
                {c.name}
              </p>
              <p className="text-xs text-navy-400">{c.slug} · {c.count} kayıt</p>
            </div>
            <button
              onClick={() => toggle(c.id, !c.isActive)}
              disabled={busy === c.id}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium",
                c.isActive
                  ? "border border-navy-200 text-navy-600 hover:bg-navy-50"
                  : "border border-emerald-300 text-emerald-700 hover:bg-emerald-50",
              )}
            >
              {busy === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {c.isActive ? "Pasifleştir" : "Aktifleştir"}
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="py-4 text-sm text-navy-400">Kategori yok.</p>}
      </div>
    </div>
  );
}

export function CategoryManager({
  serviceCategories,
  jobCategories,
}: {
  serviceCategories: CategoryRow[];
  jobCategories: CategoryRow[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel
        kind="service"
        title="Hizmet Kategorileri"
        note="Hizmet talebi formunda kullanılır."
        items={serviceCategories}
      />
      <Panel
        kind="job"
        title="İş İlanı Kategorileri"
        note="İş ilanı verirken ve filtrelerde kullanılır."
        items={jobCategories}
      />
    </div>
  );
}
