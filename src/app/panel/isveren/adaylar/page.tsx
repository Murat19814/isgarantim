import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { JobPostingStatus } from "@prisma/client";
import { auth } from "@/lib/auth/session";
import { getMyCompany } from "@/lib/services/companies";
import { listCompanyPostings } from "@/lib/services/jobs";
import { CandidateSearch } from "@/components/employer/CandidateSearch";

export const metadata = { title: "Aday Havuzu" };

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/isveren/adaylar");

  const company = await getMyCompany(session.user.id);
  if (!company) redirect("/panel/isveren");

  const postings = (await listCompanyPostings(company.id))
    .filter((p) => p.status === JobPostingStatus.ACTIVE)
    .map((p) => ({ id: p.id, title: p.title }));

  return (
    <div>
      <Link
        href="/panel/isveren"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-800"
      >
        <ArrowLeft className="h-4 w-4" /> İşveren paneline dön
      </Link>
      <h1 className="mb-1 flex items-center gap-2 font-display text-2xl font-extrabold text-navy-900">
        <Users className="h-6 w-6 text-emerald-600" /> Aday havuzu
      </h1>
      <p className="mb-6 text-sm text-navy-500">
        CV'sini firmalara açık yapan adaylar arasında filtreleyip görüşmeye davet et.
      </p>
      <CandidateSearch postings={postings} />
    </div>
  );
}
