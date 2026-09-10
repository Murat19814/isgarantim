import { listCallbacks } from "@/lib/services/callback";
import { CallbackManager, type CallbackRow } from "@/components/admin/CallbackManager";

export const metadata = { title: "Beni Arayın — Admin" };

export default async function Page() {
  const items = await listCallbacks();

  const rows: CallbackRow[] = items.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    topic: c.topic,
    city: c.city,
    status: c.status,
    adminNote: c.adminNote,
    createdByName: c.createdBy?.fullName ?? null,
    handledByName: c.handledBy?.fullName ?? null,
    createdAt: c.createdAt.toISOString().slice(0, 16).replace("T", " "),
  }));

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900">Beni Arayın</h1>
      <p className="mt-1 text-sm text-navy-500">
        Kullanıcıların bıraktığı geri arama taleplerini buradan yönet. Ara, durumu güncelle
        ve talebi birlikte oluştur.
      </p>
      <div className="mt-6">
        <CallbackManager rows={rows} />
      </div>
    </div>
  );
}
