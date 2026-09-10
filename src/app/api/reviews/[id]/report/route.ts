import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/guards";
import { reviewReportSchema } from "@/lib/validations/service";
import { reportReview, ReviewError } from "@/lib/services/reviews";

/** POST — bir yorumu şikayet et (admin incelemesine düşer). */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const parsed = reviewReportSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Doğrulama hatası" }, { status: 422 });

  try {
    const res = await reportReview(user.id, params.id, parsed.data.reason);
    return NextResponse.json({ ok: true, reported: res.reported });
  } catch (e) {
    if (e instanceof ReviewError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
