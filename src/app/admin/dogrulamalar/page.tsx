import { listPendingVerifications } from "@/lib/services/verification";
import { VerificationReviewer, type VerificationRow } from "@/components/admin/VerificationReviewer";

export const metadata = { title: "Doğrulamalar — Admin" };

export default async function Page() {
  const items = await listPendingVerifications();

  const rows: VerificationRow[] = items.map((v) => ({
    id: v.id,
    type: v.type,
    status: v.status,
    documentUrl: v.documentUrl,
    note: v.note,
    adminNote: v.adminNote,
    createdAt: v.createdAt.toISOString().slice(0, 16).replace("T", " "),
    userName: v.user.fullName,
    userEmail: v.user.email,
  }));

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900">Doğrulamalar</h1>
      <p className="mt-1 text-sm text-navy-500">
        Kullanıcıların yüklediği belgeleri incele, rozetleri onayla veya reddet.
        Belgeler gizlidir; yalnız burada görünür.
      </p>
      <div className="mt-6">
        <VerificationReviewer rows={rows} />
      </div>
    </div>
  );
}
