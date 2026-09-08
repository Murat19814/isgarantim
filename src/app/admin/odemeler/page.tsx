import { listPaymentsAdmin } from "@/lib/services/admin";
import { formatTRY } from "@/lib/utils";

export const metadata = { title: "Ödemeler — Admin" };

const STATUS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Bekliyor", cls: "bg-navy-100 text-navy-600" },
  HELD: { label: "Emanette", cls: "bg-gold-50 text-gold-600" },
  RELEASED: { label: "Aktarıldı", cls: "bg-emerald-50 text-emerald-700" },
  REFUNDED: { label: "İade", cls: "bg-navy-100 text-navy-600" },
  DISPUTED: { label: "İtirazlı", cls: "bg-red-50 text-red-600" },
  FAILED: { label: "Başarısız", cls: "bg-red-50 text-red-600" },
};

export default async function Page() {
  const payments = await listPaymentsAdmin();

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900">Ödemeler</h1>
      <p className="mt-1 text-sm text-navy-500">{payments.length} ödeme kaydı</p>

      <div className="card mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-navy-50 text-left text-xs uppercase text-navy-500">
              <tr>
                <th className="px-4 py-3">İş</th>
                <th className="px-4 py-3">Müşteri</th>
                <th className="px-4 py-3">Tutar</th>
                <th className="px-4 py-3">Komisyon</th>
                <th className="px-4 py-3">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {payments.map((p) => {
                const st = STATUS[p.status] ?? { label: p.status, cls: "bg-navy-100 text-navy-600" };
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium text-navy-900">{p.serviceRequest.title}</td>
                    <td className="px-4 py-3 text-navy-600">{p.customer.fullName}</td>
                    <td className="px-4 py-3 text-navy-900">{formatTRY(p.amount)}</td>
                    <td className="px-4 py-3 text-navy-600">{formatTRY(p.platformFee)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${st.cls}`}>{st.label}</span>
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-navy-400">Ödeme yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
