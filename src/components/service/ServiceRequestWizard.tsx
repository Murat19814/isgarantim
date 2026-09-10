"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check, ChevronLeft, ChevronRight, Loader2, MapPin, ImagePlus, X, Tag, FileText, Video, Mic, Square, Trash2, Wand2, Sparkles, RotateCcw,
} from "lucide-react";
import { cn, formatTRY } from "@/lib/utils";
import { FileUpload } from "@/components/ui/FileUpload";
import { URGENCY_LABELS, LOCATION_LABELS, CONTACT_LABELS } from "@/lib/requestMeta";

type Category = { id: string; name: string; children: { id: string; name: string }[] };

const STEPS = ["Kategori", "Konum", "Detaylar", "Fotoğraflar", "Özet"];

export function ServiceRequestWizard({
  categories,
  cities,
}: {
  categories: Category[];
  cities: readonly string[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categoryId, setCategoryId] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [urgency, setUrgency] = useState("FLEXIBLE");
  const [locationType, setLocationType] = useState("ONSITE");
  const [contactPreference, setContactPreference] = useState("PLATFORM");
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoInput, setPhotoInput] = useState("");
  const [videos, setVideos] = useState<string[]>([]);
  const [voiceNote, setVoiceNote] = useState<string>("");
  const [invitedProviderId, setInvitedProviderId] = useState<string>("");
  const [invitedName, setInvitedName] = useState<string>("");

  const selectedCategory = categories.find((c) => c.id === categoryId);

  // Hızlı modlar + Tekrar çağır: ?urgency= / ?provider= / ?category= / ?providerName=
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const u = sp.get("urgency");
    if (u === "URGENT" || u === "THIS_WEEK") setUrgency(u);
    const prov = sp.get("provider");
    if (prov) setInvitedProviderId(prov);
    const name = sp.get("providerName");
    if (name) setInvitedName(name);
    const cat = sp.get("category");
    if (cat && categories.some((c) => c.id === cat)) setCategoryId(cat);
  }, [categories]);

  function canProceed(): boolean {
    if (step === 0) return !!categoryId;
    if (step === 1) return city.length >= 2;
    if (step === 2) return title.length >= 5 && description.length >= 20;
    return true;
  }

  function addPhoto() {
    const url = photoInput.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      setError("Geçerli bir görsel bağlantısı gir.");
      return;
    }
    if (photos.length >= 8) return;
    setPhotos((p) => [...p, url]);
    setPhotoInput("");
    setError(null);
  }

  async function submit() {
    setLoading(true);
    setError(null);
    const payload = {
      categoryId,
      subCategory: subCategory || undefined,
      city,
      district: district || undefined,
      neighborhood: neighborhood || undefined,
      title,
      description,
      budgetMin: budgetMin ? Number(budgetMin) : undefined,
      budgetMax: budgetMax ? Number(budgetMax) : undefined,
      preferredDate: preferredDate
        ? new Date(preferredDate).toISOString()
        : undefined,
      urgency,
      locationType,
      contactPreference,
      photos,
      videos,
      voiceNote: voiceNote || undefined,
      invitedProviderId: invitedProviderId || undefined,
    };
    try {
      const res = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Talep oluşturulamadı.");
        return;
      }
      router.push(`/panel/hizmet-al/${data.id}`);
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6 sm:p-8">
      {invitedProviderId && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <RotateCcw className="h-4 w-4 shrink-0" />
          <span>
            {invitedName ? <b>{invitedName}</b> : "Bir ustayı"} tekrar çağırıyorsun. Talebini
            oluştur; usta özel olarak bilgilendirilecek ve teklif verebilecek.
          </span>
        </div>
      )}
      {/* Adım göstergesi */}
      <ol className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors",
                i < step && "bg-emerald-600 text-white",
                i === step && "bg-navy-800 text-white",
                i > step && "bg-navy-100 text-navy-400",
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden text-xs font-medium sm:block",
                i === step ? "text-navy-900" : "text-navy-400",
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="hidden h-px flex-1 bg-navy-100 sm:block" />
            )}
          </li>
        ))}
      </ol>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Adım 0: Kategori */}
      {step === 0 && (
        <div className="space-y-4">
          <AIAssist
            onApply={(s) => {
              if (s.categoryId && categories.some((c) => c.id === s.categoryId))
                setCategoryId(s.categoryId);
              if (s.subCategory) setSubCategory(s.subCategory);
              if (s.city) setCity(s.city);
              if (s.district) setDistrict(s.district);
              if (s.urgency) setUrgency(s.urgency);
              if (s.title) setTitle(s.title);
              if (s.description) setDescription(s.description);
            }}
            onError={(m) => setError(m)}
          />
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy-900">
            <Tag className="h-5 w-5 text-emerald-600" /> Hangi hizmete ihtiyacın var?
          </h2>
          {categories.length === 0 ? (
            <p className="rounded-xl bg-gold-50 px-4 py-3 text-sm text-navy-600">
              Kategoriler henüz yüklenmemiş. Terminalde <code>npm run db:seed</code>{" "}
              çalıştır.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCategoryId(c.id);
                      setSubCategory("");
                    }}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-sm font-medium transition-all",
                      categoryId === c.id
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-navy-200 text-navy-700 hover:border-navy-300",
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
              {selectedCategory && selectedCategory.children.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-navy-800">
                    Alt kategori (opsiyonel)
                  </label>
                  <select
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="input"
                  >
                    <option value="">Seçiniz</option>
                    {selectedCategory.children.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Adım 1: Konum */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy-900">
            <MapPin className="h-5 w-5 text-emerald-600" /> Nerede?
          </h2>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-800">Şehir</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="input">
              <option value="">Şehir seç</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-800">
                İlçe (opsiyonel)
              </label>
              <input
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="input"
                placeholder="ör. Kadıköy"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-800">
                Mahalle (opsiyonel)
              </label>
              <input
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="input"
                placeholder="ör. Caferağa"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-800">
              Hizmet nerede verilecek?
            </label>
            <select value={locationType} onChange={(e) => setLocationType(e.target.value)} className="input">
              <option value="ONSITE">Yerinde (adreste)</option>
              <option value="REMOTE">Uzaktan</option>
              <option value="BOTH">Farketmez</option>
            </select>
          </div>
        </div>
      )}

      {/* Adım 2: Detaylar */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy-900">
            <FileText className="h-5 w-5 text-emerald-600" /> İşi anlat
          </h2>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-800">Başlık</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="ör. Salon boyası (3 oda 1 salon)"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-800">Açıklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="input resize-none"
              placeholder="İşin detaylarını, metrekareyi, beklentini yaz..."
            />
            <p className="mt-1 text-xs text-navy-400">{description.length}/4000</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-800">
                Min. bütçe (₺)
              </label>
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                className="input"
                placeholder="1000"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-800">
                Maks. bütçe (₺)
              </label>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className="input"
                placeholder="3000"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-800">
                Tercih edilen tarih (opsiyonel)
              </label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-800">Aciliyet</label>
              <select value={urgency} onChange={(e) => setUrgency(e.target.value)} className="input">
                <option value="FLEXIBLE">Esnek / planlı</option>
                <option value="THIS_WEEK">Bu hafta</option>
                <option value="URGENT">Acil (bugün/yarın)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-800">
              İletişim tercihi
            </label>
            <select value={contactPreference} onChange={(e) => setContactPreference(e.target.value)} className="input">
              <option value="PLATFORM">Uygulama içi mesaj</option>
              <option value="PHONE">Telefon</option>
              <option value="BOTH">İkisi de olur</option>
            </select>
          </div>
        </div>
      )}

      {/* Adım 3: Fotoğraflar */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy-900">
            <ImagePlus className="h-5 w-5 text-emerald-600" /> Fotoğraf ekle (opsiyonel)
          </h2>
          <p className="text-sm text-navy-500">
            Cihazından fotoğraf yükleyebilir ya da bir görsel bağlantısı (URL)
            ekleyebilirsin. En fazla 8 görsel, dosya başına 5 MB.
          </p>
          <FileUpload
            accept="image/*"
            label="Cihazdan fotoğraf yükle"
            disabled={photos.length >= 8}
            onUploaded={(url) => {
              setPhotos((p) => (p.length >= 8 ? p : [...p, url]));
              setError(null);
            }}
          />
          <div className="flex gap-2">
            <input
              value={photoInput}
              onChange={(e) => setPhotoInput(e.target.value)}
              className="input"
              placeholder="https://.../foto.jpg"
            />
            <button type="button" onClick={addPhoto} className="btn-navy shrink-0">
              Ekle
            </button>
          </div>
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {photos.map((p, i) => (
                <div key={i} className="group relative overflow-hidden rounded-xl border border-navy-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p} alt="" className="h-24 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((ps) => ps.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {photos.length > 0 && (
            <PhotoDetect
              imageUrl={photos[0]}
              onApply={(categoryId) => {
                if (categoryId && categories.some((c) => c.id === categoryId)) {
                  setCategoryId(categoryId);
                }
              }}
              onError={(m) => setError(m)}
            />
          )}

          {/* Video (opsiyonel) */}
          <div className="border-t border-navy-100 pt-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-navy-800">
              <Video className="h-4 w-4 text-emerald-600" /> Video ekle (opsiyonel, en fazla 4)
            </p>
            <FileUpload
              accept="video/*"
              label="Cihazdan video yükle"
              disabled={videos.length >= 4}
              onUploaded={(url) => {
                setVideos((v) => (v.length >= 4 ? v : [...v, url]));
                setError(null);
              }}
            />
            {videos.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {videos.map((v, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-navy-100 px-2 py-1 text-xs text-navy-600">
                    <a href={v} target="_blank" rel="noreferrer" className="hover:text-navy-900">Video {i + 1}</a>
                    <button type="button" onClick={() => setVideos((arr) => arr.filter((_, j) => j !== i))}
                      className="ml-1 text-navy-400 hover:text-red-600">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sesli talep (opsiyonel) */}
          <div className="border-t border-navy-100 pt-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-navy-800">
              <Mic className="h-4 w-4 text-emerald-600" /> Sesli anlat (opsiyonel)
            </p>
            <p className="mb-2 text-xs text-navy-500">
              Yazmak yerine işini sesli anlatabilirsin. Hizmet verenler dinleyip teklif verir.
            </p>
            <VoiceRecorder
              value={voiceNote}
              onRecorded={(url) => setVoiceNote(url)}
              onClear={() => setVoiceNote("")}
              onError={(m) => setError(m)}
            />
          </div>
        </div>
      )}

      {/* Adım 4: Özet */}
      {step === 4 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold text-navy-900">Özet</h2>
          <dl className="divide-y divide-navy-100 text-sm">
            <Row label="Kategori" value={selectedCategory?.name + (subCategory ? ` · ${subCategory}` : "")} />
            <Row label="Konum" value={`${city}${district ? ` / ${district}` : ""}${neighborhood ? ` / ${neighborhood}` : ""}`} />
            <Row label="Başlık" value={title} />
            <Row label="Açıklama" value={description} />
            <Row
              label="Bütçe"
              value={
                budgetMin || budgetMax
                  ? `${budgetMin ? formatTRY(Number(budgetMin)) : "?"} - ${budgetMax ? formatTRY(Number(budgetMax)) : "?"}`
                  : "Belirtilmedi"
              }
            />
            <Row label="Tarih" value={preferredDate || "Belirtilmedi"} />
            <Row label="Aciliyet" value={URGENCY_LABELS[urgency]} />
            <Row label="Yer" value={LOCATION_LABELS[locationType]} />
            <Row label="İletişim" value={CONTACT_LABELS[contactPreference]} />
            <Row label="Fotoğraf" value={`${photos.length} adet`} />
            <Row label="Video" value={`${videos.length} adet`} />
          </dl>
        </div>
      )}

      {/* Navigasyon */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="btn-outline"
        >
          <ChevronLeft className="h-4 w-4" /> Geri
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => canProceed() && setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="btn-primary"
          >
            İleri <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="btn-primary"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Talebi yayınla
          </button>
        )}
      </div>
    </div>
  );
}

type AISuggestion = {
  categoryId?: string;
  subCategory?: string;
  city?: string;
  district?: string;
  urgency?: string;
  title?: string;
  description?: string;
};

function AIAssist({
  onApply,
  onError,
}: {
  onApply: (s: AISuggestion) => void;
  onError: (msg: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function run(payload: { text?: string; voiceUrl?: string }) {
    setBusy(true);
    setDone(false);
    try {
      const res = await fetch("/api/ai/parse-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Çözümlenemedi.");
        return;
      }
      onApply(data.suggestion as AISuggestion);
      setDone(true);
    } catch {
      onError("Sunucuya ulaşılamadı.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 text-left"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white">
          <Wand2 className="h-5 w-5" />
        </span>
        <span className="flex-1">
          <span className="block font-display text-sm font-bold text-navy-900">
            Yapay zekâ ile hızlı doldur
          </span>
          <span className="block text-xs text-navy-500">
            İhtiyacını yaz ya da sesli anlat; kategori, konum ve açıklamayı biz hazırlayalım.
          </span>
        </span>
        <ChevronRight className={cn("h-4 w-4 text-navy-400 transition-transform", open && "rotate-90")} />
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder='Örn: "Darıca’da mutfak musluğum akıtıyor, bugün gelebilecek tesisatçı arıyorum."'
            className="input resize-none"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => text.trim().length >= 10 ? run({ text }) : onError("Lütfen biraz daha ayrıntılı yaz.")}
              disabled={busy}
              className="btn-primary text-sm"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {busy ? "Hazırlanıyor..." : "Formu doldur"}
            </button>
            <VoiceRecorder
              value=""
              onRecorded={(url) => run({ voiceUrl: url })}
              onClear={() => {}}
              onError={onError}
            />
            {done && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                <Check className="h-3.5 w-3.5" /> Alanlar dolduruldu, kontrol edip devam et.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PhotoDetect({
  imageUrl,
  onApply,
  onError,
}: {
  imageUrl: string;
  onApply: (categoryId?: string) => void;
  onError: (msg: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    categoryId?: string;
    categoryName?: string;
    questions: string[];
    priceMin?: number;
    priceMax?: number;
    summary?: string;
  } | null>(null);

  async function detect() {
    setBusy(true);
    try {
      const res = await fetch("/api/ai/detect-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Tespit edilemedi.");
        return;
      }
      setResult(data.detection);
      onApply(data.detection?.categoryId);
    } catch {
      onError("Sunucuya ulaşılamadı.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-navy-100 bg-navy-50/50 p-4">
      {!result ? (
        <button type="button" onClick={detect} disabled={busy} className="btn-outline text-sm">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {busy ? "İnceleniyor..." : "Fotoğraftan tahmin et"}
        </button>
      ) : (
        <div className="space-y-2 text-sm">
          {result.summary && <p className="text-navy-700">{result.summary}</p>}
          {result.categoryName && (
            <p>
              Önerilen kategori:{" "}
              <span className="badge-emerald">{result.categoryName}</span>
            </p>
          )}
          {(result.priceMin || result.priceMax) && (
            <p className="text-navy-700">
              Tahmini fiyat aralığı:{" "}
              <span className="font-semibold">
                {result.priceMin ? formatTRY(result.priceMin) : "?"} –{" "}
                {result.priceMax ? formatTRY(result.priceMax) : "?"}
              </span>
            </p>
          )}
          {result.questions.length > 0 && (
            <div>
              <p className="font-medium text-navy-800">Netleştirilecek sorular:</p>
              <ul className="ml-4 list-disc text-navy-600">
                {result.questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="rounded-lg bg-gold-50 px-3 py-2 text-xs text-navy-600">
            ⚠️ Tahmini fiyat kesin teklif değildir; kesin fiyat için teklifleri karşılaştır.
          </p>
        </div>
      )}
    </div>
  );
}

function VoiceRecorder({
  value, onRecorded, onClear, onError,
}: {
  value: string;
  onRecorded: (url: string) => void;
  onClear: () => void;
  onError: (msg: string) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [secs, setSecs] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        setSecs(0);
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        const file = new File([blob], `talep-ses-${Date.now()}.webm`, { type: "audio/webm" });
        setUploading(true);
        try {
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: fd });
          const data = await res.json();
          if (res.ok) onRecorded(data.url);
          else onError(data.error ?? "Ses yüklenemedi.");
        } finally {
          setUploading(false);
        }
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
      setSecs(0);
      timerRef.current = setInterval(() => setSecs((s) => s + 1), 1000);
    } catch {
      onError("Mikrofona erişilemedi. İzin verdiğinden emin ol.");
    }
  }

  function stop() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  if (value) {
    return (
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio src={value} controls className="h-9 max-w-[240px]" />
        <button type="button" onClick={onClear}
          className="inline-flex items-center gap-1 text-xs text-navy-400 hover:text-red-600">
          <Trash2 className="h-3.5 w-3.5" /> Sil
        </button>
      </div>
    );
  }

  return (
    <div>
      {recording ? (
        <button type="button" onClick={stop}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white">
          <Square className="h-4 w-4" /> {secs}s · Durdur
        </button>
      ) : (
        <button type="button" onClick={start} disabled={uploading}
          className="btn-outline text-sm">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
          {uploading ? "Yükleniyor..." : "Kaydı başlat"}
        </button>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex gap-4 py-2.5">
      <dt className="w-28 shrink-0 font-medium text-navy-500">{label}</dt>
      <dd className="text-navy-900">{value || "—"}</dd>
    </div>
  );
}
