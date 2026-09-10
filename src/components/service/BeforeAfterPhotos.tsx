"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, X } from "lucide-react";
import { FileUpload } from "@/components/ui/FileUpload";

export function BeforeAfterPhotos({
  requestId,
  before,
  after,
  editable,
}: {
  requestId: string;
  before: string[];
  after: string[];
  editable: boolean;
}) {
  const router = useRouter();
  const [beforePhotos, setBeforePhotos] = useState<string[]>(before);
  const [afterPhotos, setAfterPhotos] = useState<string[]>(after);
  const [error, setError] = useState<string | null>(null);

  async function save(next: { beforePhotos?: string[]; afterPhotos?: string[] }) {
    setError(null);
    try {
      const res = await fetch(`/api/service-requests/${requestId}/photos`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Kaydedilemedi.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Sunucuya ulaşılamadı.");
    }
  }

  // Görüntüleme modunda hiç foto yoksa gösterme
  if (!editable && beforePhotos.length === 0 && afterPhotos.length === 0) return null;

  return (
    <div className="card p-6">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy-900">
        <Camera className="h-5 w-5 text-emerald-600" /> Öncesi – Sonrası
      </h2>
      {error && <div className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <PhotoColumn
          title="Öncesi"
          photos={beforePhotos}
          editable={editable}
          onAdd={(url) => {
            const next = [...beforePhotos, url].slice(0, 8);
            setBeforePhotos(next);
            save({ beforePhotos: next });
          }}
          onRemove={(i) => {
            const next = beforePhotos.filter((_, j) => j !== i);
            setBeforePhotos(next);
            save({ beforePhotos: next });
          }}
        />
        <PhotoColumn
          title="Sonrası"
          photos={afterPhotos}
          editable={editable}
          onAdd={(url) => {
            const next = [...afterPhotos, url].slice(0, 8);
            setAfterPhotos(next);
            save({ afterPhotos: next });
          }}
          onRemove={(i) => {
            const next = afterPhotos.filter((_, j) => j !== i);
            setAfterPhotos(next);
            save({ afterPhotos: next });
          }}
        />
      </div>
    </div>
  );
}

function PhotoColumn({
  title, photos, editable, onAdd, onRemove,
}: {
  title: string;
  photos: string[];
  editable: boolean;
  onAdd: (url: string) => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-navy-700">{title}</p>
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((src, i) => (
            <div key={i} className="group relative overflow-hidden rounded-xl border border-navy-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-28 w-full object-cover" />
              {editable && (
                <button type="button" onClick={() => onRemove(i)}
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        !editable && <p className="text-sm text-navy-400">Fotoğraf yok.</p>
      )}
      {editable && photos.length < 8 && (
        <div className="mt-2">
          <FileUpload accept="image/*" label={`${title} fotoğrafı ekle`} onUploaded={onAdd} />
        </div>
      )}
    </div>
  );
}
