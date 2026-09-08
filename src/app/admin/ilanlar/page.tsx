import { listJobPostingsAdmin } from "@/lib/services/admin";
import { JobPostingStatusControl } from "@/components/admin/JobPostingStatusControl";
import { WORK_TYPE_LABELS } from "@/lib/constants";

export const metadata = { title: "İş İlanları — Admin" };

export default async function Page() {
  const postings = await listJobPostingsAdmin();

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900">İş İlanları</h1>
      <p className="mt-1 text-sm text-navy-500">{postings.length} ilan · durumu değiştirebilirsin</p>

      <div className="card mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-navy-50 text-left text-xs uppercase text-navy-500">
              <tr>
                <th className="px-4 py-3">İlan</th>
                <th className="px-4 py-3">Firma</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Şehir</th>
                <th className="px-4 py-3">Başvuru</th>
                <th className="px-4 py-3">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {postings.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-navy-900">{p.title}</p>
                    <p className="text-xs text-navy-400">{WORK_TYPE_LABELS[p.workType] ?? p.workType}</p>
                  </td>
                  <td className="px-4 py-3 text-navy-600">{p.company.name}</td>
                  <td className="px-4 py-3 text-navy-600">{p.category.name}</td>
                  <td className="px-4 py-3 text-navy-600">{p.city}</td>
                  <td className="px-4 py-3 text-navy-600">{p._count.applications}</td>
                  <td className="px-4 py-3">
                    <JobPostingStatusControl id={p.id} status={p.status} />
                  </td>
                </tr>
              ))}
              {postings.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-navy-400">İlan yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
