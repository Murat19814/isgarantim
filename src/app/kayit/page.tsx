import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = { title: "Üye Ol" };

export default function Page() {
  return (
    <AuthShell
      title="Hesap oluştur"
      subtitle="Tek hesapla hizmet al, hizmet ver, iş ara veya iş ilanı ver."
      footer={
        <p>
          Zaten üye misin?{" "}
          <Link href="/giris" className="font-semibold text-emerald-600">
            Giriş yap
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
