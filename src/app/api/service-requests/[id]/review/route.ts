import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/guards";
import { reviewSchema } from "@/lib/validations/service";
import { createReview, ReviewError } from "@/lib/services/reviews";

/** POST — müşteri tamamlanmış işi değerlendirir (1-5 puan + yorum). */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const parsed = reviewSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Doğrulama hatası", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const review = await createReview(user.id, params.id, parsed.data);
    return NextResponse.json({ ok: true, id: review.id });
  } catch (e) {
    if (e instanceof ReviewError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
