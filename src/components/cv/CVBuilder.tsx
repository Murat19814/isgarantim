"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Trash2, Loader2, Save, Eye, Briefcase, GraduationCap,
  Wrench, Languages, Award, User, Globe,
} from "lucide-react";
import { CITIES, EDUCATION_LEVELS, LANGUAGE_LEVELS } from "@/lib/constants";

export type CVData = {
  title: string;
  summary: string;
  phone: string;
  email: string;
  city: string;
  birthYear: string;
  photoUrl: string;
  isVisible: boolean;
  experiences: {
    company: string; position: string; city: string;
    startDate: string; endDate: string; current: boolean; desc: string;
  }[];
  educations: {
    school: string; degree: string; field: string; startDate: string; endDate: string;
  }[];
  skills: { name: string; level: number }[];
  languages: { name: string; level: string }[];
  certificates: { name: string; issuer: string; issuedAt: string }[];
};

const EMPTY: CVData = {
  title: "", summary: "", phone: "", email: "", city: "", birthYear: "",
  photoUrl: "", isVisible: false,
  experiences: [], educations: [], skills: [], languages: [], certificates: [],
};

export function CVBuilder({ initial }: { initial: CVData | null }) {
  const router = useRouter();
  const [cv, setCv] = useState<CVData>(initial ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function set<K extends keyof CVData>(key: K, value: CVData[K]) {
    setCv((c) => ({ ...c, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      const payload = {
        ...cv,
        birthYear: cv.birthYear ? Number(cv.birthYear) : undefined,
        photoUrl: cv.photoUrl || undefined,
        email: cv.email || undefined,
      };
      const res = await fetch("/api/cv", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Kaydedilemedi.");
        return;
      }
      setMsg("CV kaydedildi ✅");
      router.refresh();
    } catch {
      setErr("Sunucuya ulaşılamadı.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {(msg || err) && (
        <div
          className={
            err
              ? "rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              : "rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          }
        >
          {err ?? msg}
        </div>
      )}

      {/* Görünürlük + kaydet çubuğu */}
      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm text-navy-700">
          <input
            type="checkbox"
            checked={cv.isVisible}
            onChange={(e) => set("isVisible", e.target.checked)}
            className="h-4 w-4 rounded border-navy-300"
          />
          <Globe className="h-4 w-4 text-emerald-600" />
          CV'm firmalara görünür olsun (aday havuzunda çıkarım)
        </label>
        <div className="flex gap-2">
          <a href="/cv-onizleme" target="_blank" className="btn-outline text-sm">
            <Eye className="h-4 w-4" /> Önizle / PDF
          </a>
          <button onClick={save} disabled={saving} className="btn-primary text-sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Kaydet
          </button>
        </div>
      </div>

      {/* Kişisel bilgiler */}
      <Section icon={<User className="h-5 w-5" />} title="Kişisel bilgiler">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Ünvan / Başlık">
            <input className="input" value={cv.title} onChange={(e) => set("title", e.target.value)} placeholder="Örn: Muhasebe Uzmanı" />
          </Field>
          <Field label="Şehir">
            <select className="input" value={cv.city} onChange={(e) => set("city", e.target.value)}>
              <option value="">Seç</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Telefon">
            <input className="input" value={cv.phone} onChange={(e) => set("phone", e.target.value)} placeholder="05xx xxx xx xx" />
          </Field>
          <Field label="E-posta">
            <input className="input" value={cv.email} onChange={(e) => set("email", e.target.value)} placeholder="ad@ornek.com" />
          </Field>
          <Field label="Doğum yılı">
            <input type="number" className="input" value={cv.birthYear} onChange={(e) => set("birthYear", e.target.value)} placeholder="1990" />
          </Field>
          <Field label="Fotoğraf URL (opsiyonel)">
            <input className="input" value={cv.photoUrl} onChange={(e) => set("photoUrl", e.target.value)} placeholder="https://..." />
          </Field>
        </div>
        <Field label="Özet / Hakkımda">
          <textarea className="input resize-none" rows={3} value={cv.summary} onChange={(e) => set("summary", e.target.value)} placeholder="Kendini kısaca tanıt..." />
        </Field>
      </Section>

      {/* Deneyim */}
      <Section
        icon={<Briefcase className="h-5 w-5" />}
        title="İş deneyimi"
        onAdd={() =>
          set("experiences", [...cv.experiences, { company: "", position: "", city: "", startDate: "", endDate: "", current: false, desc: "" }])
        }
      >
        {cv.experiences.length === 0 && <Empty text="Henüz deneyim eklenmedi." />}
        {cv.experiences.map((e, i) => (
          <Row key={i} onRemove={() => set("experiences", cv.experiences.filter((_, j) => j !== i))}>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="input" value={e.position} onChange={(ev) => updateArr(setCv, "experiences", i, { position: ev.target.value })} placeholder="Pozisyon" />
              <input className="input" value={e.company} onChange={(ev) => updateArr(setCv, "experiences", i, { company: ev.target.value })} placeholder="Firma" />
              <input className="input" value={e.city} onChange={(ev) => updateArr(setCv, "experiences", i, { city: ev.target.value })} placeholder="Şehir" />
              <div className="grid grid-cols-2 gap-2">
                <input type="month" className="input" value={e.startDate} onChange={(ev) => updateArr(setCv, "experiences", i, { startDate: ev.target.value })} />
                <input type="month" className="input" value={e.endDate} disabled={e.current} onChange={(ev) => updateArr(setCv, "experiences", i, { endDate: ev.target.value })} />
              </div>
            </div>
            <label className="mt-2 flex items-center gap-2 text-xs text-navy-600">
              <input type="checkbox" checked={e.current} onChange={(ev) => updateArr(setCv, "experiences", i, { current: ev.target.checked })} />
              Halen çalışıyorum
            </label>
            <textarea className="input mt-2 resize-none" rows={2} value={e.desc} onChange={(ev) => updateArr(setCv, "experiences", i, { desc: ev.target.value })} placeholder="Görev tanımı (opsiyonel)" />
          </Row>
        ))}
      </Section>

      {/* Eğitim */}
      <Section
        icon={<GraduationCap className="h-5 w-5" />}
        title="Eğitim"
        onAdd={() => set("educations", [...cv.educations, { school: "", degree: "", field: "", startDate: "", endDate: "" }])}
      >
        {cv.educations.length === 0 && <Empty text="Henüz eğitim eklenmedi." />}
        {cv.educations.map((e, i) => (
          <Row key={i} onRemove={() => set("educations", cv.educations.filter((_, j) => j !== i))}>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="input" value={e.school} onChange={(ev) => updateArr(setCv, "educations", i, { school: ev.target.value })} placeholder="Okul / Üniversite" />
              <select className="input" value={e.degree} onChange={(ev) => updateArr(setCv, "educations", i, { degree: ev.target.value })}>
                <option value="">Derece</option>
                {EDUCATION_LEVELS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <input className="input" value={e.field} onChange={(ev) => updateArr(setCv, "educations", i, { field: ev.target.value })} placeholder="Bölüm" />
              <div className="grid grid-cols-2 gap-2">
                <input type="month" className="input" value={e.startDate} onChange={(ev) => updateArr(setCv, "educations", i, { startDate: ev.target.value })} />
                <input type="month" className="input" value={e.endDate} onChange={(ev) => updateArr(setCv, "educations", i, { endDate: ev.target.value })} />
              </div>
            </div>
          </Row>
        ))}
      </Section>

      {/* Yetenek */}
      <Section
        icon={<Wrench className="h-5 w-5" />}
        title="Yetenekler"
        onAdd={() => set("skills", [...cv.skills, { name: "", level: 3 }])}
      >
        {cv.skills.length === 0 && <Empty text="Henüz yetenek eklenmedi." />}
        <div className="grid gap-2 sm:grid-cols-2">
          {cv.skills.map((s, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl border border-navy-100 p-2">
              <input className="input flex-1" value={s.name} onChange={(ev) => updateArr(setCv, "skills", i, { name: ev.target.value })} placeholder="Örn: Excel" />
              <select className="input w-20" value={s.level} onChange={(ev) => updateArr(setCv, "skills", i, { level: Number(ev.target.value) })}>
                {[1, 2, 3, 4, 5].map((l) => <option key={l} value={l}>{l}/5</option>)}
              </select>
              <button onClick={() => set("skills", cv.skills.filter((_, j) => j !== i))} className="text-navy-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Dil */}
      <Section
        icon={<Languages className="h-5 w-5" />}
        title="Yabancı diller"
        onAdd={() => set("languages", [...cv.languages, { name: "", level: "B1" }])}
      >
        {cv.languages.length === 0 && <Empty text="Henüz dil eklenmedi." />}
        <div className="grid gap-2 sm:grid-cols-2">
          {cv.languages.map((l, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl border border-navy-100 p-2">
              <input className="input flex-1" value={l.name} onChange={(ev) => updateArr(setCv, "languages", i, { name: ev.target.value })} placeholder="Örn: İngilizce" />
              <select className="input w-28" value={l.level} onChange={(ev) => updateArr(setCv, "languages", i, { level: ev.target.value })}>
                {LANGUAGE_LEVELS.map((lv) => <option key={lv} value={lv}>{lv}</option>)}
              </select>
              <button onClick={() => set("languages", cv.languages.filter((_, j) => j !== i))} className="text-navy-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Sertifika */}
      <Section
        icon={<Award className="h-5 w-5" />}
        title="Sertifikalar"
        onAdd={() => set("certificates", [...cv.certificates, { name: "", issuer: "", issuedAt: "" }])}
      >
        {cv.certificates.length === 0 && <Empty text="Henüz sertifika eklenmedi." />}
        {cv.certificates.map((c, i) => (
          <Row key={i} onRemove={() => set("certificates", cv.certificates.filter((_, j) => j !== i))}>
            <div className="grid gap-3 sm:grid-cols-3">
              <input className="input" value={c.name} onChange={(ev) => updateArr(setCv, "certificates", i, { name: ev.target.value })} placeholder="Sertifika adı" />
              <input className="input" value={c.issuer} onChange={(ev) => updateArr(setCv, "certificates", i, { issuer: ev.target.value })} placeholder="Kurum" />
              <input type="month" className="input" value={c.issuedAt} onChange={(ev) => updateArr(setCv, "certificates", i, { issuedAt: ev.target.value })} />
            </div>
          </Row>
        ))}
      </Section>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          CV'yi kaydet
        </button>
      </div>
    </div>
  );
}

// Yardımcı bileşenler
function Section({
  icon, title, children, onAdd,
}: {
  icon: React.ReactNode; title: string; children: React.ReactNode; onAdd?: () => void;
}) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-navy-900">
          <span className="text-emerald-600">{icon}</span> {title}
        </h3>
        {onAdd && (
          <button onClick={onAdd} className="btn-outline text-sm">
            <Plus className="h-4 w-4" /> Ekle
          </button>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <label className="mb-1 block text-xs font-medium text-navy-700">{label}</label>
      {children}
    </div>
  );
}

function Row({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="relative rounded-xl border border-navy-100 bg-navy-50/40 p-4">
      <button onClick={onRemove} className="absolute right-3 top-3 text-navy-400 hover:text-red-600">
        <Trash2 className="h-4 w-4" />
      </button>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-navy-400">{text}</p>;
}

// Dizi elemanını kısmi günceller
function updateArr<K extends "experiences" | "educations" | "skills" | "languages" | "certificates">(
  setCv: React.Dispatch<React.SetStateAction<CVData>>,
  key: K,
  index: number,
  patch: Partial<CVData[K][number]>,
) {
  setCv((c) => {
    const arr = [...c[key]] as CVData[K];
    arr[index] = { ...arr[index], ...patch } as CVData[K][number];
    return { ...c, [key]: arr };
  });
}
