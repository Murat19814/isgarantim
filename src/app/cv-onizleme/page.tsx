import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Mail, Star } from "lucide-react";
import { auth } from "@/lib/auth/session";
import { getCV } from "@/lib/services/cv";
import { PrintButton } from "@/components/cv/PrintButton";

export const metadata = { title: "CV Önizleme" };

function fmt(d: Date | null): string {
  return d ? d.toLocaleDateString("tr-TR", { month: "short", year: "numeric" }) : "";
}

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/cv-onizleme");

  const cv = await getCV(session.user.id);

  if (!cv) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <p className="text-navy-500">Henüz bir CV oluşturmadın.</p>
        <Link href="/panel/is-ara" className="btn-primary mt-4 inline-flex">
          CV oluştur
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50/40 py-8">
      {/* Üst bar — yazdırırken gizli */}
      <div className="container-page mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/panel/is-ara"
          className="inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-800"
        >
          <ArrowLeft className="h-4 w-4" /> Panele dön
        </Link>
        <PrintButton />
      </div>

      {/* CV kağıdı */}
      <div className="mx-auto max-w-3xl bg-white p-10 shadow-card print:shadow-none">
        <header className="flex items-start justify-between gap-6 border-b-2 border-navy-800 pb-6">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-navy-900">
              {session.user.name}
            </h1>
            {cv.title && <p className="mt-1 text-lg text-emerald-700">{cv.title}</p>}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-navy-600">
              {cv.city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {cv.city}
                </span>
              )}
              {cv.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-4 w-4" /> {cv.phone}
                </span>
              )}
              {cv.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-4 w-4" /> {cv.email}
                </span>
              )}
              {cv.birthYear && <span>Doğum: {cv.birthYear}</span>}
            </div>
          </div>
          {cv.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cv.photoUrl} alt="" className="h-28 w-28 rounded-xl object-cover" />
          )}
        </header>

        {cv.summary && (
          <Section title="Hakkımda">
            <p className="whitespace-pre-line text-sm text-navy-700">{cv.summary}</p>
          </Section>
        )}

        {cv.experiences.length > 0 && (
          <Section title="İş Deneyimi">
            <div className="space-y-4">
              {cv.experiences.map((e) => (
                <div key={e.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold text-navy-900">
                      {e.position} · {e.company}
                    </p>
                    <p className="shrink-0 text-xs text-navy-400">
                      {fmt(e.startDate)} — {e.current ? "Devam" : fmt(e.endDate)}
                    </p>
                  </div>
                  {e.city && <p className="text-xs text-navy-400">{e.city}</p>}
                  {e.desc && <p className="mt-1 text-sm text-navy-600">{e.desc}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {cv.educations.length > 0 && (
          <Section title="Eğitim">
            <div className="space-y-3">
              {cv.educations.map((e) => (
                <div key={e.id} className="flex items-baseline justify-between gap-2">
                  <div>
                    <p className="font-semibold text-navy-900">{e.school}</p>
                    <p className="text-sm text-navy-600">
                      {[e.degree, e.field].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs text-navy-400">
                    {fmt(e.startDate)} {e.endDate ? `— ${fmt(e.endDate)}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          {cv.skills.length > 0 && (
            <Section title="Yetenekler">
              <ul className="space-y-1 text-sm text-navy-700">
                {cv.skills.map((s) => (
                  <li key={s.id} className="flex items-center justify-between">
                    <span>{s.name}</span>
                    <span className="inline-flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${i < s.level ? "fill-gold-400 text-gold-400" : "text-navy-200"}`}
                        />
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {cv.languages.length > 0 && (
            <Section title="Yabancı Diller">
              <ul className="space-y-1 text-sm text-navy-700">
                {cv.languages.map((l) => (
                  <li key={l.id} className="flex items-center justify-between">
                    <span>{l.name}</span>
                    <span className="text-navy-400">{l.level}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        {cv.certificates.length > 0 && (
          <Section title="Sertifikalar">
            <ul className="space-y-1 text-sm text-navy-700">
              {cv.certificates.map((c) => (
                <li key={c.id} className="flex items-baseline justify-between gap-2">
                  <span>{c.name}{c.issuer ? ` — ${c.issuer}` : ""}</span>
                  <span className="shrink-0 text-xs text-navy-400">{fmt(c.issuedAt)}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-emerald-700">
        {title}
      </h2>
      {children}
    </section>
  );
}
