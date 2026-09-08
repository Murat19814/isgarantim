import { listComplaints } from "@/lib/services/admin";
import { ComplaintResolve } from "@/components/admin/ComplaintResolve";

export const metadata = { title: "Şikayetler — Admin" };

export default async function Page() {
  const complaints = await listComplaints();

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900">Şikayetler</h1>
      <p className="mt-1 text-sm text-navy-500">{complaints.length} kayıt</p>

      <div className="mt-6 space-y-3">
        {complaints.map((c) => (
          <div key={c.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-navy-100 px-2 py-0.5 text-xs text-navy-600">
                    {c.subjectType}
                  </span>
                  {c.isResolved ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">Çözüldü</span>
                  ) : (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600">Bekliyor</span>
                  )}
                </div>
                <p className="mt-2 font-medium text-navy-900">{c.reason}</p>
                {c.detail && <p className="mt-1 text-sm text-navy-600">{c.detail}</p>}
                <p className="mt-1 text-xs text-navy-400">
                  Bildiren: {c.reporter.fullName} · Konu ID: {c.subjectId} · {c.createdAt.toISOString().slice(0, 10)}
                </p>
              </div>
              <ComplaintResolve id={c.id} resolved={c.isResolved} />
            </div>
          </div>
        ))}
        {complaints.length === 0 && (
          <div className="card p-8 text-center text-navy-400">Şikayet yok. 🎉</div>
        )}
      </div>
    </div>
  );
}
