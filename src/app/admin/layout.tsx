import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = { title: "Yönetim Paneli" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/admin");
  if (!session.user.roles?.includes("ADMIN")) redirect("/panel");

  return (
    <div className="flex min-h-screen flex-col bg-navy-50/40 lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden p-5 lg:p-8">{children}</main>
    </div>
  );
}
