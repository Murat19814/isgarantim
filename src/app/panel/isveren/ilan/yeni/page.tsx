import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth/session";
import { getMyCompany, getRemainingQuota } from "@/lib/services/companies";
import { listJobCategories } from "@/lib/services/jobs";
import { JobPostingForm } from "@/components/employer/JobPostingForm";

export const metadata = { title: "Yeni İlan" };

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/isveren/ilan/yeni");

  const company = await getMyCompany(session.user.id);
  if (!company) redirect("/panel/isveren");

  const [categories, remainingQuota] = await Promise.all([
    listJobCategories(),
    getRemainingQuota(company.id),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/panel/isveren"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-800"
      >
        <ArrowLeft className="h-4 w-4" /> İşveren paneline dön
      </Link>
      <h1 className="mb-2 font-display text-2xl font-extrabold text-navy-900">
        Yeni iş ilanı
      </h1>
      <p className="mb-6 text-sm text-navy-500">
        Kalan ilan hakkın: <b>{remainingQuota}</b>
        {remainingQuota === 0 && (
          <>
            {" "}— <Link href="/panel/isveren" className="text-emerald-600 underline">plan satın al</Link>
          </>
        )}
      </p>
      <JobPostingForm categories={categories} />
    </div>
  );
}
