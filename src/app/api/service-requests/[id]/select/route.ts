import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/guards";
import { selectOffer, OfferError } from "@/lib/services/offers";

const schema = z.object({ offerId: z.string().min(1) });

/** POST — müşteri kazanan teklifi seçer (kazanan kesilir, kaybedenlere iade). */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 422 });
  }

  try {
    const result = await selectOffer(user.id, params.id, parsed.data.offerId);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    if (e instanceof OfferError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
