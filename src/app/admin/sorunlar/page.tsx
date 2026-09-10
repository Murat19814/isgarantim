import { listProblemReports } from "@/lib/services/admin";
import { ProblemManager, type ProblemRow } from "@/components/admin/ProblemManager";

export const metadata = { title: "Sorun Bildirimleri — Admin" };

export default async function Page() {
  const reports = await listProblemReports();

  const rows: ProblemRow[] = reports.map((r) => ({
    id: r.id,
    type: r.type,
    status: r.status,
    description: r.description,
    media: r.media,
    adminNote: r.adminNote,
    createdAt: r.createdAt.toISOString().slice(0, 16).replace("T", " "),
    reporterName: r.reporter.fullName,
    reporterEmail: r.reporter.email,
    requestId: r.serviceRequest.id,
    requestTitle: r.serviceRequest.title,
    city: r.serviceRequest.city,
  }));

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900">Sorun Bildirimleri</h1>
      <p className="mt-1 text-sm text-navy-500">
        Kullanıcıların bildirdiği sorunları incele, durumu güncelle. Gerekirse ilgili
        kullanıcıyı Kullanıcılar sayfasından askıya al.
      </p>
      <div className="mt-6">
        <ProblemManager reports={rows} />
      </div>
    </div>
  );
}
