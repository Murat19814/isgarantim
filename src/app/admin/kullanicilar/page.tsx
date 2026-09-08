import { listUsers } from "@/lib/services/admin";
import { UsersTable, type UserRow } from "@/components/admin/UsersTable";

export const metadata = { title: "Kullanıcılar — Admin" };

export default async function Page() {
  const users = await listUsers();

  const rows: UserRow[] = users.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone ?? "",
    roles: u.roles as string[],
    banned: u.isBanned,
    verified: !!u.emailVerified && !!u.phoneVerified,
    createdAt: u.createdAt.toISOString().slice(0, 10),
  }));

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900">Kullanıcılar</h1>
      <p className="mt-1 text-sm text-navy-500">
        {rows.length} kullanıcı · rolleri düzenle, hesabı yasakla/aç.
      </p>
      <div className="mt-6">
        <UsersTable users={rows} />
      </div>
    </div>
  );
}
