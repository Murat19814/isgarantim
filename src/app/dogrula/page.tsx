import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { VerifyForm } from "@/components/auth/VerifyForm";

export const metadata = { title: "Hesabını Doğrula" };

export default function Page() {
  return (
    <AuthShell
      title="Hesabını doğrula"
      subtitle="E-postana ve telefonuna gönderdiğimiz 6 haneli kodları gir."
    >
      <Suspense fallback={null}>
        <VerifyForm />
      </Suspense>
    </AuthShell>
  );
}
