import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/guards";
import { markAllRead, markRead } from "@/lib/services/notifications";

/**
 * POST — bildirim(ler)i okundu işaretle.
 * Gövde { id } verilirse tek bildirim, verilmezse tümü okunur.
 */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { id?: string };
  if (body?.id) {
    await markRead(user.id, body.id);
  } else {
    await markAllRead(user.id);
  }
  return NextResponse.json({ ok: true });
}
