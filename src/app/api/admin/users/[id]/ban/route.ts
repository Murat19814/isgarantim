import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser, isAdmin } from "@/lib/auth/guards";
import { setUserBan } from "@/lib/services/admin";

const schema = z.object({ banned: z.boolean() });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!isAdmin(user)) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek." }, { status: 422 });

  const res = await setUserBan(params.id, parsed.data.banned);
  return NextResponse.json({ ok: true, isBanned: res.isBanned });
}
