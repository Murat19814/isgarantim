import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/guards";
import { fundEscrow, PaymentError } from "@/lib/services/payments";

/** POST — müşteri iş ücretini emanete alır (mock ödeme). */
export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  try {
    const payment = await fundEscrow(user.id, params.id);
    return NextResponse.json({ ok: true, status: payment.status });
  } catch (e) {
    if (e instanceof PaymentError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
