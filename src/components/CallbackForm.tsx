"use client";

import { useState } from "react";
import { Phone, Loader2, CheckCircle2 } from "lucide-react";

export function CallbackForm({ defaultName = "" }: { defaultName?: string }) {
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2 || phone.trim().length < 7) {
      setError("Lütfen adını ve geçerli bir telefon numarası yaz.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, topic, city }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      setError("Bir hata oluştu, lütfen tekrar dene.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="card flex flex-col items-center gap-3 p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        <h3 className="font-display text-lg font-bold text-navy-900">Talebini aldık!</h3>
        <p className="text-sm text-navy-500">
          Ekibimiz en kısa sürede seni arayacak ve talebini birlikte oluşturacağız.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-800">Adın</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Adın Soyadın" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-800">Telefon</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="05xx xxx xx xx" inputMode="tel" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-800">Şehir (opsiyonel)</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} className="input" placeholder="İstanbul" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-800">Konu (opsiyonel)</label>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} className="input" placeholder="ör. Boya işi" />
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary inline-flex w-full items-center justify-center gap-2">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
        Beni arayın
      </button>
      <p className="text-center text-xs text-navy-400">
        Numaran yalnızca seni aramamız için kullanılır, herkese açık gösterilmez.
      </p>
    </form>
  );
}
