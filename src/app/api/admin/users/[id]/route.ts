import { NextResponse } from "next/server";
import { getSessionUser, isAdmin } from "@/lib/auth/guards";
import { deleteUser, AdminError } from "@/lib/services/admin";

/** DELETE — admin kullanıcıyı kalıcı olarak siler (tüm ilişkileriyle). */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!isAdmin(user)) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  try {
    await deleteUser(params.id, user!.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AdminError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error("[deleteUser] başarısız:", e);
    return NextResponse.json({ error: "Silme başarısız." }, { status: 500 });
  }
}
