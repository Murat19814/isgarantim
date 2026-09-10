import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser, isAdmin } from "@/lib/auth/guards";
import { updateCallback } from "@/lib/services/callback";

const schema = z.object({
  status: z.enum(["NEW", "CONTACTED", "DONE", "CANCELLED"]),
  adminNote: z.string().max(2000).optional(),
});

/** PATCH — admin/operatör 'Beni arayın' talebini günceller. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!isAdmin(user)) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Doğrulama hatası" }, { status: 422 });
  }

  const res = await updateCallback(params.id, parsed.data.status, user!.id, parsed.data.adminNote);
  return NextResponse.json({ ok: true, status: res.status });
}
