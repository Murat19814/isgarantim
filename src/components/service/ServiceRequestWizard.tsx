"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check, ChevronLeft, ChevronRight, Loader2, MapPin, ImagePlus, X, Tag, FileText,
} from "lucide-react";
import { cn, formatTRY } from "@/lib/utils";
import { FileUpload } from "@/components/ui/FileUpload";

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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoInput, setPhotoInput] = useState("");

  const selectedCategory = categories.find((c) => c.id === categoryId);

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
      title,
      description,
      budgetMin: budgetMin ? Number(budgetMin) : undefined,
      budgetMax: budgetMax ? Number(budgetMax) : undefined,
      preferredDate: preferredDate
        ? new Date(preferredDate).toISOString()
        : undefined,
      photos,
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
        </div>
      )}

      {/* Adım 4: Özet */}
      {step === 4 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold text-navy-900">Özet</h2>
          <dl className="divide-y divide-navy-100 text-sm">
            <Row label="Kategori" value={selectedCategory?.name + (subCategory ? ` · ${subCategory}` : "")} />
            <Row label="Konum" value={`${city}${district ? ` / ${district}` : ""}`} />
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
            <Row label="Fotoğraf" value={`${photos.length} adet`} />
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

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex gap-4 py-2.5">
      <dt className="w-28 shrink-0 font-medium text-navy-500">{label}</dt>
      <dd className="text-navy-900">{value || "—"}</dd>
    </div>
  );
}
