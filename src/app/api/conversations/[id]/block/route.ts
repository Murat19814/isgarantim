import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/guards";
import {
  blockConversationPeer,
  unblockConversationPeer,
  MessagingError,
} from "@/lib/services/messaging";

const blockSchema = z.object({ reason: z.string().max(300).optional() });

/** POST — konuşmadaki karşı tarafı engelle. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const parsed = blockSchema.safeParse(await req.json().catch(() => ({})));
  const reason = parsed.success ? parsed.data.reason : undefined;

  try {
    await blockConversationPeer(user.id, params.id, reason);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof MessagingError)
      return NextResponse.json({ error: e.message }, { status: 403 });
    throw e;
  }
}

/** DELETE — engeli kaldır. */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  try {
    await unblockConversationPeer(user.id, params.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof MessagingError)
      return NextResponse.json({ error: e.message }, { status: 403 });
    throw e;
  }
}
