import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Briefcase, Send, Mail, Search } from "lucide-react";
import { auth } from "@/lib/auth/session";
import { getCV } from "@/lib/services/cv";
import { listMyApplications, listMyInvitations } from "@/lib/services/jobs";
import { CVBuilder, type CVData } from "@/components/cv/CVBuilder";

export const metadata = { title: "İş Arayan Paneli" };

const APP_STATUS: Record<string, string> = {
  APPLIED: "Başvuruldu",
  REVIEWED: "İncelendi",
  SHORTLISTED: "Ön elemede",
  INVITED: "Görüşmeye davet",
  REJECTED: "Olumsuz",
  HIRED: "İşe alındı",
};

function ym(d: Date | null): string {
  return d ? d.toISOString().slice(0, 7) : "";
}

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/is-ara");

  const [cv, applications, invitations] = await Promise.all([
    getCV(session.user.id),
    listMyApplications(session.user.id),
    listMyInvitations(session.user.id),
  ]);

  const initial: CVData | null = cv
    ? {
        title: cv.title ?? "",
        summary: cv.summary ?? "",
        phone: cv.phone ?? "",
        email: cv.email ?? "",
        city: cv.city ?? "",
        birthYear: cv.birthYear ? String(cv.birthYear) : "",
        photoUrl: cv.photoUrl ?? "",
        isVisible: cv.isVisible,
        experiences: cv.experiences.map((e) => ({
          company: e.company,
          position: e.position,
          city: e.city ?? "",
          startDate: ym(e.startDate),
          endDate: ym(e.endDate),
          current: e.current,
          desc: e.desc ?? "",
        })),
        educations: cv.educations.map((e) => ({
          school: e.school,
          degree: e.degree ?? "",
          field: e.field ?? "",
          startDate: ym(e.startDate),
          endDate: ym(e.endDate),
        })),
        skills: cv.skills.map((s) => ({ name: s.name, level: s.level })),
        languages: cv.languages.map((l) => ({ name: l.name, level: l.level })),
        certificates: cv.certificates.map((c) => ({
          name: c.name,
          issuer: c.issuer ?? "",
          issuedAt: ym(c.issuedAt),
        })),
      }
    : null;

  return (
    <div>
      <Link
        href="/panel"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-800"
      >
        <ArrowLeft className="h-4 w-4" /> Panele dön
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-navy-900">
          İş arayan paneli
        </h1>
        <Link href="/is-ara" className="btn-outline text-sm">
          <Search className="h-4 w-4" /> İlanları gör
        </Link>
      </div>

      {/* Görüşme davetleri */}
      {invitations.length > 0 && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
          <h2 className="flex items-center gap-2 font-semibold text-emerald-800">
            <Mail className="h-4 w-4" /> Görüşme davetlerin ({invitations.length})
          </h2>
          <div className="mt-3 space-y-2">
            {invitations.map((inv) => (
              <div key={inv.id} className="rounded-xl bg-white p-3 text-sm">
                <p className="font-medium text-navy-900">
                  {inv.jobPosting.company.name} — {inv.jobPosting.title}
                </p>
                {inv.message && <p className="mt-1 text-navy-600">{inv.message}</p>}
                {inv.proposedAt && (
                  <p className="mt-1 text-xs text-navy-400">
                    Önerilen tarih: {new Date(inv.proposedAt).toLocaleString("tr-TR")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Başvurularım */}
      <div className="mt-6">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-navy-900">
          <Send className="h-5 w-5 text-emerald-600" /> Başvurularım ({applications.length})
        </h2>
        {applications.length === 0 ? (
          <p className="card p-4 text-sm text-navy-400">
            Henüz başvurun yok. <Link href="/is-ara" className="text-emerald-600 underline">İlanlara göz at</Link>.
          </p>
        ) : (
          <div className="space-y-2">
            {applications.map((a) => (
              <Link
                key={a.id}
                href={`/is-ara/${a.jobPosting.id}`}
                className="card flex items-center justify-between p-4 hover:shadow-card"
              >
                <div>
                  <p className="font-medium text-navy-900">{a.jobPosting.title}</p>
                  <p className="text-xs text-navy-400">{a.jobPosting.company.name} · {a.jobPosting.city}</p>
                </div>
                <span className="badge-navy">{APP_STATUS[a.status] ?? a.status}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CV oluşturucu */}
      <div className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-navy-900">
          <Briefcase className="h-5 w-5 text-emerald-600" /> Özgeçmişim (CV)
        </h2>
        <CVBuilder initial={initial} />
      </div>
    </div>
  );
}
