"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { CITIES, EDUCATION_LEVELS, WORK_TYPE_LABELS, WORK_TYPE_VALUES } from "@/lib/constants";

type Category = { id: string; name: string };

export function JobPostingForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [f, setF] = useState({
    categoryId: "",
    title: "",
    description: "",
    city: "",
    district: "",
    workType: "FULL_TIME",
    salaryMin: "",
    salaryMax: "",
    experienceMin: "",
    educationLevel: "",
    languages: "",
    skills: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function set(k: keyof typeof f, v: string) {
    setF((s) => ({ ...s, [k]: v }));
  }

  async function submit() {
    setLoading(true);
    setErr(null);
    try {
      const payload = {
        categoryId: f.categoryId,
        title: f.title,
        description: f.description,
        city: f.city,
        district: f.district || undefined,
        workType: f.workType,
        salaryMin: f.salaryMin ? Number(f.salaryMin) : undefined,
        salaryMax: f.salaryMax ? Number(f.salaryMax) : undefined,
        experienceMin: f.experienceMin ? Number(f.experienceMin) : undefined,
        educationLevel: f.educationLevel || undefined,
        languages: f.languages.split(",").map((s) => s.trim()).filter(Boolean),
        skills: f.skills.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const res = await fetch("/api/job-postings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "İlan yayınlanamadı.");
        return;
      }
      router.push(`/panel/isveren/ilan/${data.id}`);
      router.refresh();
    } catch {
      setErr("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card space-y-4 p-6">
      {err && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-700">Kategori *</label>
          <select className="input" value={f.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
            <option value="">Seç</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-700">Çalışma şekli *</label>
          <select className="input" value={f.workType} onChange={(e) => set("workType", e.target.value)}>
            {WORK_TYPE_VALUES.map((w) => <option key={w} value={w}>{WORK_TYPE_LABELS[w]}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-navy-700">İlan başlığı *</label>
        <input className="input" value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Örn: Kıdemli Muhasebe Uzmanı" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-navy-700">Açıklama *</label>
        <textarea className="input resize-none" rows={6} value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="Görev tanımı, aranan nitelikler, yan haklar..." />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-700">Şehir *</label>
          <select className="input" value={f.city} onChange={(e) => set("city", e.target.value)}>
            <option value="">Seç</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-700">İlçe</label>
          <input className="input" value={f.district} onChange={(e) => set("district", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-700">Min. maaş (₺)</label>
          <input type="number" className="input" value={f.salaryMin} onChange={(e) => set("salaryMin", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-700">Maks. maaş (₺)</label>
          <input type="number" className="input" value={f.salaryMax} onChange={(e) => set("salaryMax", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-700">Min. deneyim (yıl)</label>
          <input type="number" className="input" value={f.experienceMin} onChange={(e) => set("experienceMin", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-700">Eğitim seviyesi</label>
          <select className="input" value={f.educationLevel} onChange={(e) => set("educationLevel", e.target.value)}>
            <option value="">Farketmez</option>
            {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-700">Diller (virgülle)</label>
          <input className="input" value={f.languages} onChange={(e) => set("languages", e.target.value)} placeholder="İngilizce, Almanca" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-700">Yetenekler (virgülle)</label>
          <input className="input" value={f.skills} onChange={(e) => set("skills", e.target.value)} placeholder="Excel, SAP, Ekip yönetimi" />
        </div>
      </div>

      <button onClick={submit} disabled={loading || !f.categoryId || !f.title || !f.city} className="btn-primary w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        İlanı yayınla (1 ilan hakkı kullanılır)
      </button>
    </div>
  );
}
