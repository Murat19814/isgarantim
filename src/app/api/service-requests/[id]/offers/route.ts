import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { getSessionUser, hasRole } from "@/lib/auth/guards";
import { offerSchema } from "@/lib/validations/service";
import { createOffer, OfferError } from "@/lib/services/offers";

/** POST — hizmet veren bu talebe teklif verir (kontör beklemeye alınır). */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  if (!hasRole(user, UserRole.PROVIDER))
    return NextResponse.json(
      { error: "Teklif vermek için 'Hizmet Veren' rolü gerekli." },
      { status: 403 },
    );

  const parsed = offerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Doğrulama hatası", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const offer = await createOffer(user.id, params.id, parsed.data);
    return NextResponse.json({ ok: true, id: offer.id }, { status: 201 });
  } catch (e) {
    if (e instanceof OfferError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
