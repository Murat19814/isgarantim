import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/guards";
import { reviewReplySchema } from "@/lib/validations/service";
import { replyToReview, ReviewError } from "@/lib/services/reviews";

/** POST — hizmet veren yoruma yanıt verir (tek sefer). */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const parsed = reviewReplySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Doğrulama hatası" }, { status: 422 });

  try {
    const res = await replyToReview(user.id, params.id, parsed.data.reply);
    return NextResponse.json({ ok: true, id: res.id });
  } catch (e) {
    if (e instanceof ReviewError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
