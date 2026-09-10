"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X, Plus, ImagePlus, CalendarDays, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileUpload } from "@/components/ui/FileUpload";
import { WEEKDAYS } from "@/lib/validations/profile";

type Category = { id: string; name: string };
type Initial = {
  headline: string;
  bio: string;
  city: string;
  district: string;
  coverUrl: string;
  experienceYears?: number;
  availabilityNote: string;
  serviceAreas: string[];
  portfolio: string[];
  categoryIds: string[];
  workDays: string[];
  workStart: string;
  workEnd: string;
  sameDayAvailable: boolean;
};

export function ProviderProfileForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial: Initial | null;
}) {
  const router = useRouter();
  const [headline, setHeadline] = useState(initial?.headline ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [district, setDistrict] = useState(initial?.district ?? "");
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? "");
  const [experienceYears, setExperienceYears] = useState(
    initial?.experienceYears != null ? String(initial.experienceYears) : "",
  );
  const [availabilityNote, setAvailabilityNote] = useState(initial?.availabilityNote ?? "");
  const [serviceAreas, setServiceAreas] = useState<string[]>(initial?.serviceAreas ?? []);
  const [areaInput, setAreaInput] = useState("");
  const [portfolio, setPortfolio] = useState<string[]>(initial?.portfolio ?? []);
  const [categoryIds, setCategoryIds] = useState<string[]>(initial?.categoryIds ?? []);
  const [workDays, setWorkDays] = useState<string[]>(initial?.workDays ?? []);
  const [workStart, setWorkStart] = useState(initial?.workStart ?? "");
  const [workEnd, setWorkEnd] = useState(initial?.workEnd ?? "");
  const [sameDayAvailable, setSameDayAvailable] = useState(initial?.sameDayAvailable ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function toggleCategory(id: string) {
    setCategoryIds((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  }
  function addArea() {
    const a = areaInput.trim();
    if (!a || serviceAreas.includes(a)) return;
    setServiceAreas((s) => [...s, a]);
    setAreaInput("");
  }

  async function submit() {
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/provider-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: headline || undefined,
          bio: bio || undefined,
          city: city || undefined,
          district: district || undefined,
          coverUrl: coverUrl || undefined,
          experienceYears: experienceYears ? Number(experienceYears) : undefined,
          availabilityNote: availabilityNote || undefined,
          serviceAreas,
          portfolio,
          categoryIds,
          workDays,
          workStart: workStart || undefined,
          workEnd: workEnd || undefined,
          sameDayAvailable,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kaydedilemedi.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card space-y-5 p-6">
      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-800">Başlık / unvan</label>
        <input value={headline} onChange={(e) => setHeadline(e.target.value)} className="input"
          placeholder="ör. Boya & Badana Ustası" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-800">Hakkında</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="input resize-none"
          placeholder="Deneyimini, uzmanlık alanlarını ve çalışma tarzını anlat..." />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-800">Şehir</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} className="input" placeholder="İstanbul" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-800">İlçe</label>
          <input value={district} onChange={(e) => setDistrict(e.target.value)} className="input" placeholder="Kadıköy" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-800">Deneyim (yıl)</label>
          <input type="number" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)}
            className="input" placeholder="5" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-800">Müsaitlik</label>
          <input value={availabilityNote} onChange={(e) => setAvailabilityNote(e.target.value)}
            className="input" placeholder="Hafta içi 09-18" />
        </div>
      </div>

      {/* Hizmet bölgeleri */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-800">Hizmet bölgeleri</label>
        <div className="flex gap-2">
          <input value={areaInput} onChange={(e) => setAreaInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addArea())}
            className="input" placeholder="ör. Kadıköy, Üsküdar" />
          <button type="button" onClick={addArea} className="btn-navy shrink-0">
            <Plus className="h-4 w-4" /> Ekle
          </button>
        </div>
        {serviceAreas.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {serviceAreas.map((a) => (
              <span key={a} className="inline-flex items-center gap-1 rounded-full bg-navy-100 px-3 py-1 text-sm text-navy-700">
                {a}
                <button type="button" onClick={() => setServiceAreas((s) => s.filter((x) => x !== a))}
                  className="text-navy-400 hover:text-red-600">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Müsaitlik takvimi */}
      <div className="rounded-xl border border-navy-100 bg-navy-50/40 p-4">
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-navy-800">
          <CalendarDays className="h-4 w-4 text-emerald-600" /> Çalışma günlerin & saatlerin
        </label>
        <div className="flex flex-wrap gap-1.5">
          {WEEKDAYS.map((d) => (
            <button key={d.key} type="button"
              onClick={() => setWorkDays((w) => w.includes(d.key) ? w.filter((x) => x !== d.key) : [...w, d.key])}
              className={cn("rounded-lg border px-3 py-1.5 text-sm transition-colors",
                workDays.includes(d.key)
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-navy-200 text-navy-600 hover:border-navy-300")}>
              {d.label}
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-navy-500">Başlangıç</label>
            <input type="time" value={workStart} onChange={(e) => setWorkStart(e.target.value)} className="input" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-navy-500">Bitiş</label>
            <input type="time" value={workEnd} onChange={(e) => setWorkEnd(e.target.value)} className="input" />
          </div>
        </div>
        <label className="mt-3 inline-flex items-center gap-2 text-sm text-navy-700">
          <input type="checkbox" checked={sameDayAvailable} onChange={(e) => setSameDayAvailable(e.target.checked)}
            className="h-4 w-4 rounded border-navy-300 text-emerald-600" />
          <Zap className="h-4 w-4 text-gold-500" /> Aynı gün hizmet verebilirim
        </label>
      </div>

      {/* Kategoriler */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-800">Verdiğin hizmetler</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c.id} type="button" onClick={() => toggleCategory(c.id)}
              className={cn("rounded-full border px-3 py-1.5 text-sm transition-colors",
                categoryIds.includes(c.id)
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-navy-200 text-navy-600 hover:border-navy-300")}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Kapak görseli */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-800">Kapak görseli</label>
        {coverUrl ? (
          <div className="relative overflow-hidden rounded-xl border border-navy-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl} alt="" className="h-32 w-full object-cover" />
            <button type="button" onClick={() => setCoverUrl("")}
              className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <FileUpload accept="image/*" label="Kapak yükle" onUploaded={(u) => setCoverUrl(u)} />
        )}
      </div>

      {/* Portföy */}
      <div>
        <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-navy-800">
          <ImagePlus className="h-4 w-4 text-emerald-600" /> Portföy (foto/video, en fazla 20)
        </label>
        <FileUpload accept="image/*,video/*" label="Portföy öğesi ekle" disabled={portfolio.length >= 20}
          onUploaded={(u) => setPortfolio((p) => (p.length >= 20 ? p : [...p, u]))} />
        {portfolio.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {portfolio.map((p, i) => (
              <div key={i} className="group relative overflow-hidden rounded-xl border border-navy-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p} alt="" className="h-24 w-full object-cover" />
                <button type="button" onClick={() => setPortfolio((ps) => ps.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={submit} disabled={loading} className="btn-primary w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? "Kaydedildi ✓" : "Profili kaydet"}
      </button>
    </div>
  );
}
