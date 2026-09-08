import { listServiceRequestsAdmin } from "@/lib/services/admin";

export const metadata = { title: "Hizmet Talepleri — Admin" };

const STATUS: Record<string, string> = {
  DRAFT: "Taslak",
  OPEN: "Açık",
  OFFER_SELECTED: "Teklif seçildi",
  IN_ESCROW: "Emanette",
  DELIVERED: "Teslim edildi",
  COMPLETED: "Tamamlandı",
  DISPUTED: "İtirazlı",
  CANCELLED: "İptal",
};

export default async function Page() {
  const requests = await listServiceRequestsAdmin();

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900">Hizmet Talepleri</h1>
      <p className="mt-1 text-sm text-navy-500">{requests.length} talep</p>

      <div className="card mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-navy-50 text-left text-xs uppercase text-navy-500">
              <tr>
                <th className="px-4 py-3">Başlık</th>
                <th className="px-4 py-3">Müşteri</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Şehir</th>
                <th className="px-4 py-3">Teklif</th>
                <th className="px-4 py-3">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {requests.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-navy-900">{r.title}</td>
                  <td className="px-4 py-3 text-navy-600">{r.customer.fullName}</td>
                  <td className="px-4 py-3 text-navy-600">{r.category.name}</td>
                  <td className="px-4 py-3 text-navy-600">{r.city}</td>
                  <td className="px-4 py-3 text-navy-600">{r._count.offers}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-navy-100 px-2 py-0.5 text-xs text-navy-700">
                      {STATUS[r.status] ?? r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-navy-400">Talep yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
