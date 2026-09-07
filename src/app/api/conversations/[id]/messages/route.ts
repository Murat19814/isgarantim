import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/guards";
import { messageSchema } from "@/lib/validations/service";
import {
  listMessages,
  sendMessage,
  MessagingError,
} from "@/lib/services/messaging";

/** GET — konuşmadaki mesajlar (iletişim kilitliyse maskeli). */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  try {
    const data = await listMessages(user.id, params.id);
    return NextResponse.json(data);
  } catch (e) {
    if (e instanceof MessagingError)
      return NextResponse.json({ error: e.message }, { status: 403 });
    throw e;
  }
}

/** POST — konuşmaya mesaj gönder. */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const parsed = messageSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Doğrulama hatası", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const message = await sendMessage(user.id, params.id, parsed.data);
    return NextResponse.json({ ok: true, id: message.id }, { status: 201 });
  } catch (e) {
    if (e instanceof MessagingError)
      return NextResponse.json({ error: e.message }, { status: 403 });
    throw e;
  }
}
