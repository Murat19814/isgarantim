import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Giriş Yap" };

export default function Page() {
  return (
    <AuthShell
      title="Tekrar hoş geldin"
      subtitle="Hesabına giriş yaparak kaldığın yerden devam et."
      footer={
        <p>
          Hesabın yok mu?{" "}
          <Link href="/kayit" className="font-semibold text-emerald-600">
            Üye ol
          </Link>
        </p>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
