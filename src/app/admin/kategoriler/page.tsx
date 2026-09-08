import { listServiceCategoriesAdmin, listJobCategoriesAdmin } from "@/lib/services/admin";
import { CategoryManager, type CategoryRow } from "@/components/admin/CategoryManager";

export const metadata = { title: "Kategoriler — Admin" };

export default async function Page() {
  const [service, job] = await Promise.all([
    listServiceCategoriesAdmin(),
    listJobCategoriesAdmin(),
  ]);

  const serviceRows: CategoryRow[] = service.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    isActive: c.isActive,
    count: c._count.children,
  }));
  const jobRows: CategoryRow[] = job.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    isActive: c.isActive,
    count: c._count.postings,
  }));

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900">Kategoriler</h1>
      <p className="mt-1 text-sm text-navy-500">Hizmet ve iş ilanı kategorilerini yönet.</p>
      <div className="mt-6">
        <CategoryManager serviceCategories={serviceRows} jobCategories={jobRows} />
      </div>
    </div>
  );
}
