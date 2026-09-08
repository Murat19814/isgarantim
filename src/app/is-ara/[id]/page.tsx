import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, MapPin, Briefcase, Wallet, Building2, BadgeCheck,
  GraduationCap, Clock, Globe,
} from "lucide-react";
import { auth } from "@/lib/auth/session";
import { getJobPosting, getApplicationFor } from "@/lib/services/jobs";
import { WORK_TYPE_LABELS } from "@/lib/constants";
import { formatTRY } from "@/lib/utils";
import { ApplyBox } from "@/components/jobs/ApplyBox";

export default async function Page({ params }: { params: { id: string } }) {
  const posting = await getJobPosting(params.id);
  if (!posting) notFound();

  const session = await auth();
  const application = session?.user
    ? await getApplicationFor(session.user.id, posting.id)
    : null;

  return (
    <div className="container-page py-10">
      <Link
        href="/is-ara"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-800"
      >
        <ArrowLeft className="h-4 w-4" /> İlanlara dön
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ana içerik */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center gap-3">
              {posting.company.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={posting.company.logoUrl} alt="" className="h-14 w-14 rounded-xl object-cover" />
              ) : (
                <span className="grid h-14 w-14 place-items-center rounded-xl bg-navy-100 text-navy-500">
                  <Building2 className="h-6 w-6" />
                </span>
              )}
              <div>
                <p className="flex items-center gap-1 text-sm font-medium text-navy-600">
                  {posting.company.name}
                  {posting.company.verified && <BadgeCheck className="h-4 w-4 text-emerald-600" />}
                </p>
                <span className="badge-navy mt-1">{posting.category.name}</span>
              </div>
            </div>

            <h1 className="mt-4 font-display text-2xl font-extrabold text-navy-900">
              {posting.title}
            </h1>

            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-navy-500">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {posting.city}{posting.district ? ` / ${posting.district}` : ""}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" /> {WORK_TYPE_LABELS[posting.workType] ?? posting.workType}
              </span>
              {(posting.salaryMin || posting.salaryMax) && (
                <span className="inline-flex items-center gap-1.5">
                  <Wallet className="h-4 w-4" />
                  {posting.salaryMin ? formatTRY(posting.salaryMin) : "?"} - {posting.salaryMax ? formatTRY(posting.salaryMax) : "?"}
                </span>
              )}
              {posting.experienceMin != null && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {posting.experienceMin}+ yıl deneyim
                </span>
              )}
              {posting.educationLevel && (
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" /> {posting.educationLevel}
                </span>
              )}
            </div>

            <div className="prose-navy mt-5 whitespace-pre-line text-navy-700">
              {posting.description}
            </div>

            {(posting.skills.length > 0 || posting.languages.length > 0) && (
              <div className="mt-5">
                <p className="mb-2 text-sm font-semibold text-navy-800">Aranan nitelikler</p>
                <div className="flex flex-wrap gap-1.5">
                  {posting.skills.map((s, i) => (
                    <span key={`s${i}`} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">{s}</span>
                  ))}
                  {posting.languages.map((l, i) => (
                    <span key={`l${i}`} className="inline-flex items-center gap-1 rounded-full bg-navy-100 px-2.5 py-1 text-xs text-navy-600">
                      <Globe className="h-3 w-3" /> {l}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {posting.company.about && (
            <div className="card mt-6 p-6">
              <h2 className="mb-2 font-display text-lg font-bold text-navy-900">
                {posting.company.name} hakkında
              </h2>
              <p className="text-sm text-navy-600">{posting.company.about}</p>
              {posting.company.website && (
                <a href={posting.company.website} target="_blank" className="mt-2 inline-block text-sm text-emerald-600 underline">
                  {posting.company.website}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Başvuru kutusu */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 p-6">
            <h2 className="mb-4 font-display text-lg font-bold text-navy-900">Başvuru</h2>
            {session?.user ? (
              <ApplyBox postingId={posting.id} alreadyApplied={!!application} />
            ) : (
              <div className="text-sm text-navy-600">
                <p>Başvurmak için giriş yapmalısın.</p>
                <Link href={`/giris?callbackUrl=/is-ara/${posting.id}`} className="btn-primary mt-3 w-full">
                  Giriş yap
                </Link>
                <Link href="/kayit" className="btn-outline mt-2 w-full">
                  Üye ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
