import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/session";
import { getReferralSummary, REFERRAL_TIERS } from "@/lib/services/referral";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ReferralPanel } from "@/components/referral/ReferralPanel";

export const metadata = { title: "Arkadaşını Davet Et" };

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/davet");

  const summary = await getReferralSummary(session.user.id);

  return (
    <>
      <Navbar />
      <main className="container-page py-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-2xl font-extrabold text-navy-900">
            Arkadaşını davet et
          </h1>
          <p className="mt-1 text-sm text-navy-500">
            İşKalkan hep ücretsiz. Davet ettiğin arkadaşların katılıp hesabını doğruladıkça
            rozetler ve <b>Kurucu Üye</b> unvanı kazanırsın. (Para veya ödeme yok — sadece topluluk ödülleri.)
          </p>

          <ReferralPanel
            code={summary.code}
            validCount={summary.validCount}
            totalInvited={summary.totalInvited}
            isFounder={summary.isFounder}
            tierLabel={summary.tier?.label ?? null}
            nextLabel={summary.next?.label ?? null}
            nextMin={summary.next?.min ?? null}
            tiers={REFERRAL_TIERS.map((t) => ({ min: t.min, label: t.label, founder: t.founder }))}
            invitees={summary.invitees}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
