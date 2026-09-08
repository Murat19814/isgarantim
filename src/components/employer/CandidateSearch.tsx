"use client";

import { useState } from "react";
import { Search, Loader2, MapPin, Briefcase, CalendarCheck, UserX } from "lucide-react";
import { CITIES, EDUCATION_LEVELS } from "@/lib/constants";

type Candidate = {
  cvId: string;
  userId: string;
  fullName: string;
  title: string | null;
  summary: string | null;
  city: string | null;
  years: number;
  skills: string[];
  languages: string[];
};

type Posting = { id: string; title: string };

export function CandidateSearch({ postings }: { postings: Posting[] }) {
  const [f, setF] = useState({ q: "", city: "", minExperience: "", educationLevel: "", language: "", skill: "" });
  const [results, setResults] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedPosting, setSelectedPosting] = useState(postings[0]?.id ?? "");
  const [invited, setInvited] = useState<Record<string, boolean>>({});

  function set(k: keyof typeof f, v: string) {
    setF((s) => ({ ...s, [k]: v }));
  }

  async function search() {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      Object.entries(f).forEach(([k, v]) => { if (v) params.set(k, v); });
      const res = await fetch(`/api/candidates?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setResults(data.candidates);
    } finally {
      setLoading(false);
    }
  }

  async function invite(candidateId: string) {
    if (!selectedPosting) {
      alert("Önce davet edilecek ilanı seç.");
      return;
    }
    const message = window.prompt("Görüşme daveti mesajı (opsiyonel):") ?? undefined;
    await fetch(`/api/job-postings/${selectedPosting}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId, message }),
    });
    setInvited((s) => ({ ...s, [candidateId]: true }));
  }

  return (
    <div className="space-y-6">
      {/* Filtreler */}
      <div className="card p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <input className="input" placeholder="Anahtar kelime (ünvan/özet)" value={f.q} onChange={(e) => set("q", e.target.value)} />
          <select className="input" value={f.city} onChange={(e) => set("city", e.target.value)}>
            <option value="">Tüm şehirler</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="number" className="input" placeholder="Min. deneyim (yıl)" value={f.minExperience} onChange={(e) => set("minExperience", e.target.value)} />
          <select className="input" value={f.educationLevel} onChange={(e) => set("educationLevel", e.target.value)}>
            <option value="">Tüm eğitim seviyeleri</option>
            {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <input className="input" placeholder="Yabancı dil (örn: İngilizce)" value={f.language} onChange={(e) => set("language", e.target.value)} />
          <input className="input" placeholder="Yetenek (örn: Excel)" value={f.skill} onChange={(e) => set("skill", e.target.value)} />
        </div>
        <button onClick={search} disabled={loading} className="btn-primary mt-3">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Adayları ara
        </button>
      </div>

      {/* Davet edilecek ilan seçimi */}
      {postings.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-navy-600">
          <span>Davet için ilan:</span>
          <select className="input max-w-xs" value={selectedPosting} onChange={(e) => setSelectedPosting(e.target.value)}>
            {postings.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
      )}

      {/* Sonuçlar */}
      {searched && !loading && results.length === 0 && (
        <div className="card p-8 text-center text-navy-500">
          Kriterlere uygun görünür CV bulunamadı.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {results.map((c) => (
          <div key={c.cvId} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-navy-900">{c.fullName}</p>
                <p className="text-xs text-navy-400">{c.title ?? "—"}</p>
              </div>
              <span className="badge-emerald inline-flex items-center gap-1">
                <Briefcase className="h-3 w-3" /> {c.years} yıl
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-400">
              {c.city && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {c.city}</span>}
            </div>
            {c.summary && <p className="mt-2 line-clamp-2 text-sm text-navy-600">{c.summary}</p>}
            <div className="mt-2 flex flex-wrap gap-1">
              {c.skills.slice(0, 6).map((s, i) => (
                <span key={i} className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">{s}</span>
              ))}
              {c.languages.slice(0, 4).map((l, i) => (
                <span key={`l${i}`} className="rounded-full bg-navy-100 px-2 py-0.5 text-xs text-navy-600">{l}</span>
              ))}
            </div>
            <button
              onClick={() => invite(c.userId)}
              disabled={invited[c.userId] || postings.length === 0}
              className="btn-outline mt-3 w-full text-sm disabled:opacity-60"
            >
              {invited[c.userId] ? "Davet gönderildi ✓" : (<><CalendarCheck className="h-4 w-4" /> Görüşmeye davet et</>)}
            </button>
          </div>
        ))}
      </div>

      {postings.length === 0 && (
        <p className="flex items-center gap-2 text-sm text-navy-400">
          <UserX className="h-4 w-4" /> Davet gönderebilmek için önce aktif bir ilanın olmalı.
        </p>
      )}
    </div>
  );
}
