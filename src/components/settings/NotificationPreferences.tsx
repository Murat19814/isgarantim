"use client";

import { useState } from "react";
import { Loader2, Mail, MessageSquare, Bell, Target, Briefcase, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

type Prefs = {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  newMatch: boolean;
  workflow: boolean;
  messages: boolean;
  marketing: boolean;
};

export function NotificationPreferences({ initial }: { initial: Prefs }) {
  const [prefs, setPrefs] = useState<Prefs>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof Prefs>(key: K, value: Prefs[K]) {
    setPrefs((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (res.ok) setSaved(true);
      else setError("Kaydedilemedi.");
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-navy-900">Kanallar</h2>
        <div className="space-y-1">
          <Toggle icon={<Bell className="h-4 w-4" />} label="Uygulama içi bildirim"
            hint="Her zaman açık" checked disabled onChange={() => {}} />
          <Toggle icon={<Mail className="h-4 w-4" />} label="E-posta"
            checked={prefs.emailEnabled} onChange={(v) => set("emailEnabled", v)} />
          <Toggle icon={<MessageSquare className="h-4 w-4" />} label="SMS"
            hint="Sağlayıcı bağlandığında etkinleşir"
            checked={prefs.smsEnabled} onChange={(v) => set("smsEnabled", v)} />
          <Toggle icon={<Bell className="h-4 w-4" />} label="Push (mobil/tarayıcı)"
            checked={prefs.pushEnabled} onChange={(v) => set("pushEnabled", v)} />
        </div>
      </section>

      <section className="card p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-navy-900">Bildirim türleri</h2>
        <div className="space-y-1">
          <Toggle icon={<Target className="h-4 w-4" />} label="Sana uygun yeni talepler"
            checked={prefs.newMatch} onChange={(v) => set("newMatch", v)} />
          <Toggle icon={<Briefcase className="h-4 w-4" />} label="Teklif, randevu ve iş akışı"
            checked={prefs.workflow} onChange={(v) => set("workflow", v)} />
          <Toggle icon={<MessageSquare className="h-4 w-4" />} label="Yeni mesajlar"
            checked={prefs.messages} onChange={(v) => set("messages", v)} />
          <Toggle icon={<Megaphone className="h-4 w-4" />} label="Duyuru ve kampanyalar"
            checked={prefs.marketing} onChange={(v) => set("marketing", v)} />
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button onClick={save} disabled={saving} className="btn-primary w-full">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? "Kaydedildi ✓" : "Tercihleri kaydet"}
      </button>
    </div>
  );
}

function Toggle({
  icon, label, hint, checked, disabled, onChange,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={cn("flex items-center justify-between rounded-xl px-3 py-3", disabled ? "opacity-60" : "hover:bg-navy-50 cursor-pointer")}>
      <span className="flex items-center gap-2.5 text-sm text-navy-800">
        <span className="text-navy-400">{icon}</span>
        {label}
        {hint && <span className="text-xs text-navy-400">· {hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-emerald-600" : "bg-navy-200",
          disabled && "cursor-not-allowed",
        )}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", checked ? "translate-x-5" : "translate-x-0.5")} />
      </button>
    </label>
  );
}
