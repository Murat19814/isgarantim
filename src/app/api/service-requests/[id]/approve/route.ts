import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/guards";
import { approveWork, PaymentError } from "@/lib/services/payments";

/** POST — müşteri işi onaylar, ödeme hizmet verene aktarılır. */
export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  try {
    const result = await approveWork(user.id, params.id);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof PaymentError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
