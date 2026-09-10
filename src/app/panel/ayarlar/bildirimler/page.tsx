import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth/session";
import { getPreferences } from "@/lib/services/preferences";
import { NotificationPreferences } from "@/components/settings/NotificationPreferences";

export const metadata = { title: "Bildirim Tercihleri" };

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/ayarlar/bildirimler");

  const pref = await getPreferences(session.user.id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/panel"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-800"
      >
        <ArrowLeft className="h-4 w-4" /> Panele dön
      </Link>
      <h1 className="mb-1 font-display text-2xl font-extrabold text-navy-900">Bildirim tercihleri</h1>
      <p className="mb-6 text-sm text-navy-500">
        Hangi bildirimleri, hangi kanaldan almak istediğini seç. Uygulama içi bildirimler her zaman açıktır.
      </p>
      <NotificationPreferences
        initial={{
          emailEnabled: pref.emailEnabled,
          smsEnabled: pref.smsEnabled,
          pushEnabled: pref.pushEnabled,
          newMatch: pref.newMatch,
          workflow: pref.workflow,
          messages: pref.messages,
          marketing: pref.marketing,
        }}
      />
    </div>
  );
}
