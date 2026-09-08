import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser, isAdmin } from "@/lib/auth/guards";
import { resolveDispute, AdminError } from "@/lib/services/admin";

const schema = z.object({
  inFavorOf: z.enum(["CUSTOMER", "PROVIDER"]),
  note: z.string().max(1000).optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!isAdmin(user)) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek." }, { status: 422 });

  try {
    await resolveDispute(params.id, parsed.data.inFavorOf, parsed.data.note);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AdminError) return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
