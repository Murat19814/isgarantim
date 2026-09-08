import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/guards";
import { disputeSchema } from "@/lib/validations/service";
import { openDispute, PaymentError } from "@/lib/services/payments";

/** POST — müşteri veya hizmet veren itiraz açar (ödeme durdurulur). */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const parsed = disputeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Doğrulama hatası", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const result = await openDispute(user.id, params.id, parsed.data.reason);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof PaymentError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
