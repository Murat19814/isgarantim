import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, KeyRound } from "lucide-react";
import { auth } from "@/lib/auth/session";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";

export const metadata = { title: "Şifre Değiştir" };

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/ayarlar/sifre");

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/panel"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-800"
      >
        <ArrowLeft className="h-4 w-4" /> Panele dön
      </Link>
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
          <KeyRound className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-navy-900">
            Şifre değiştir
          </h1>
          <p className="text-sm text-navy-500">
            Güvenliğin için güçlü ve benzersiz bir şifre kullan.
          </p>
        </div>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
