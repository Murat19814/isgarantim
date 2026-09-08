import { listDisputes } from "@/lib/services/admin";
import { DisputeResolver, type DisputeRow } from "@/components/admin/DisputeResolver";

export const metadata = { title: "İtirazlar — Admin" };

export default async function Page() {
  const disputes = await listDisputes();

  const rows: DisputeRow[] = disputes.map((d) => ({
    id: d.id,
    status: d.status,
    reason: d.reason,
    createdAt: d.createdAt.toISOString().slice(0, 10),
    resolutionNote: d.resolutionNote,
    requestId: d.serviceRequest.id,
    requestTitle: d.serviceRequest.title,
    city: d.serviceRequest.city,
    customerName: d.serviceRequest.customer.fullName,
    amount: d.serviceRequest.payment?.amount ?? 0,
    paymentStatus: d.serviceRequest.payment?.status ?? "—",
  }));

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900">İtirazlar</h1>
      <p className="mt-1 text-sm text-navy-500">
        Emanetteki ödemeyi müşteriye iade et veya hizmet verene aktar.
      </p>
      <div className="mt-6">
        <DisputeResolver disputes={rows} />
      </div>
    </div>
  );
}
