import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Plus, Users, MapPin, FileText, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth/session";
import { getMyCompany, getRemainingQuota } from "@/lib/services/companies";
import { listCompanyPostings } from "@/lib/services/jobs";
import { EmployerDashboard } from "@/components/employer/EmployerDashboard";
import { WORK_TYPE_LABELS } from "@/lib/constants";

export const metadata = { title: "İşveren Paneli" };

const POST_STATUS: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: "Yayında", cls: "badge-emerald" },
  DRAFT: { label: "Taslak", cls: "badge-navy" },
  PENDING_PAYMENT: { label: "Ödeme bekliyor", cls: "badge-gold" },
  PAUSED: { label: "Duraklatıldı", cls: "badge-navy" },
  EXPIRED: { label: "Süresi doldu", cls: "badge-navy" },
  CLOSED: { label: "Kapandı", cls: "badge-navy" },
};

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/isveren");

  const company = await getMyCompany(session.user.id);
  const [remainingQuota, postings] = await Promise.all([
    company ? getRemainingQuota(company.id) : Promise.resolve(0),
    company ? listCompanyPostings(company.id) : Promise.resolve([]),
  ]);

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
          İşveren paneli
        </h1>
        {company && (
          <div className="flex gap-2">
            <Link href="/panel/isveren/adaylar" className="btn-outline text-sm">
              <Users className="h-4 w-4" /> Aday havuzu
            </Link>
            <Link href="/panel/isveren/ilan/yeni" className="btn-primary text-sm">
              <Plus className="h-4 w-4" /> Yeni ilan
            </Link>
          </div>
        )}
      </div>

      <div className="mt-6">
        <EmployerDashboard
          initialCompany={
            company
              ? {
                  name: company.name,
                  taxNumber: company.taxNumber ?? "",
                  city: company.city ?? "",
                  website: company.website ?? "",
                  logoUrl: company.logoUrl ?? "",
                  about: company.about ?? "",
                }
              : null
          }
          hasCompany={!!company}
          remainingQuota={remainingQuota}
        />
      </div>

      {/* İlanlar */}
      {company && (
        <div className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-navy-900">
            <FileText className="h-5 w-5 text-emerald-600" /> İlanlarım ({postings.length})
          </h2>
          {postings.length === 0 ? (
            <p className="card p-4 text-sm text-navy-400">
              Henüz ilanın yok. Plan satın alıp ilk ilanını yayınla.
            </p>
          ) : (
            <div className="space-y-3">
              {postings.map((p) => {
                const st = POST_STATUS[p.status] ?? { label: p.status, cls: "badge-navy" };
                return (
                  <Link
                    key={p.id}
                    href={`/panel/isveren/ilan/${p.id}`}
                    className="group card flex items-center gap-4 p-5 hover:shadow-card"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={st.cls}>{st.label}</span>
                        <span className="text-xs text-navy-400">{p.category.name}</span>
                      </div>
                      <p className="mt-1 truncate font-semibold text-navy-900">{p.title}</p>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-400">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {p.city}
                        </span>
                        <span>{WORK_TYPE_LABELS[p.workType] ?? p.workType}</span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> {p._count.applications} başvuru
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0 text-navy-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
