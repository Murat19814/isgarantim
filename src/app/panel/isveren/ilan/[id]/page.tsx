import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MapPin, Briefcase, Wallet, Users } from "lucide-react";
import { auth } from "@/lib/auth/session";
import { getMyCompany } from "@/lib/services/companies";
import { getJobPosting, listApplicationsForPosting } from "@/lib/services/jobs";
import { getEnabledMap } from "@/lib/services/flags";
import { ApplicationsManager } from "@/components/employer/ApplicationsManager";
import { HighlightControls } from "@/components/employer/HighlightControls";
import { WORK_TYPE_LABELS } from "@/lib/constants";
import { formatTRY } from "@/lib/utils";

export const metadata = { title: "İlan Detayı" };

export default async function Page({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/isveren");

  const [company, posting] = await Promise.all([
    getMyCompany(session.user.id),
    getJobPosting(params.id),
  ]);
  if (!posting) notFound();
  if (!company || posting.company.id !== company.id) redirect("/panel/isveren");

  const [applications, flags] = await Promise.all([
    listApplicationsForPosting(session.user.id, params.id),
    getEnabledMap(["featured_jobs", "urgent_jobs"]),
  ]);
  const showHighlight = flags.featured_jobs || flags.urgent_jobs;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/panel/isveren"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-800"
      >
        <ArrowLeft className="h-4 w-4" /> İşveren paneline dön
      </Link>

      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge-navy">{posting.category.name}</span>
          {posting.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-xs font-semibold text-gold-700">
              ⭐ Öne çıkan
            </span>
          )}
          {posting.isUrgent && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
              Acil
            </span>
          )}
        </div>
        <h1 className="mt-3 font-display text-2xl font-extrabold text-navy-900">
          {posting.title}
        </h1>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-navy-500">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> {posting.city}
            {posting.district ? ` / ${posting.district}` : ""}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Briefcase className="h-4 w-4" /> {WORK_TYPE_LABELS[posting.workType] ?? posting.workType}
          </span>
          {(posting.salaryMin || posting.salaryMax) && (
            <span className="inline-flex items-center gap-1.5">
              <Wallet className="h-4 w-4" />
              {posting.salaryMin ? formatTRY(posting.salaryMin) : "?"} -{" "}
              {posting.salaryMax ? formatTRY(posting.salaryMax) : "?"}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4" /> {posting._count.applications} başvuru
          </span>
        </div>
        <p className="mt-4 whitespace-pre-line text-navy-600">{posting.description}</p>
        {(posting.skills.length > 0 || posting.languages.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {posting.skills.map((s, i) => (
              <span key={`s${i}`} className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">{s}</span>
            ))}
            {posting.languages.map((l, i) => (
              <span key={`l${i}`} className="rounded-full bg-navy-100 px-2 py-0.5 text-xs text-navy-600">{l}</span>
            ))}
          </div>
        )}
      </div>

      {showHighlight && (
        <div className="mt-6">
          <HighlightControls
            postingId={posting.id}
            featured={posting.isFeatured}
            urgent={posting.isUrgent}
            featuredEnabled={flags.featured_jobs}
            urgentEnabled={flags.urgent_jobs}
          />
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-4 font-display text-xl font-bold text-navy-900">
          Başvurular ({applications.length})
        </h2>
        <ApplicationsManager postingId={posting.id} applications={applications} />
      </div>
    </div>
  );
}
