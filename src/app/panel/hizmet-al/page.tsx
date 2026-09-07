import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, ArrowLeft, MapPin, Users, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth/session";
import { listCustomerRequests } from "@/lib/services/serviceRequests";

export const metadata = { title: "Hizmet Taleplerim" };

const STATUS: Record<string, { label: string; cls: string }> = {
  OPEN: { label: "Teklif topluyor", cls: "badge-emerald" },
  OFFER_SELECTED: { label: "Teklif seçildi", cls: "badge-gold" },
  IN_ESCROW: { label: "Ödeme emanette", cls: "badge-gold" },
  DELIVERED: { label: "Onay bekliyor", cls: "badge-gold" },
  COMPLETED: { label: "Tamamlandı", cls: "badge-navy" },
  DISPUTED: { label: "İtiraz", cls: "badge-navy" },
  CANCELLED: { label: "İptal", cls: "badge-navy" },
  DRAFT: { label: "Taslak", cls: "badge-navy" },
};

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/hizmet-al");

  const requests = await listCustomerRequests(session.user.id);

  return (
    <div>
      <Link
        href="/panel"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-800"
      >
        <ArrowLeft className="h-4 w-4" /> Panele dön
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-navy-900">
          Hizmet taleplerim
        </h1>
        <Link href="/panel/hizmet-al/yeni" className="btn-primary">
          <Plus className="h-4 w-4" /> Yeni talep
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="text-navy-500">Henüz bir hizmet talebin yok.</p>
          <Link href="/panel/hizmet-al/yeni" className="btn-primary mt-4 inline-flex">
            <Plus className="h-4 w-4" /> İlk talebini oluştur
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {requests.map((r) => {
            const st = STATUS[r.status] ?? STATUS.OPEN;
            return (
              <Link
                key={r.id}
                href={`/panel/hizmet-al/${r.id}`}
                className="group card flex items-center gap-4 p-5 transition-all hover:shadow-card"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={st.cls}>{st.label}</span>
                    <span className="text-xs text-navy-400">{r.category.name}</span>
                  </div>
                  <p className="mt-1 truncate font-semibold text-navy-900">{r.title}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-400">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {r.city}
                      {r.district ? ` / ${r.district}` : ""}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {r._count.offers} teklif
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-navy-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
