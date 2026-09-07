import { PanelPlaceholder } from "@/components/PanelPlaceholder";

export const metadata = { title: "İşveren Paneli" };

export default function Page() {
  return (
    <PanelPlaceholder
      title="İşveren / Firma Paneli"
      description="Kurumsal hesap, ilan yayınlama (tek/paket/abonelik), aday filtreleme ve görüşme daveti buradan yönetilecek."
      phase="Faz 5 — Firma & iş ilanları"
    />
  );
}
