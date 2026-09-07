import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/guards";
import { purchaseCredits } from "@/lib/services/credits";
import { purchaseCreditsSchema } from "@/lib/validations/service";

/**
 * Kontör satın alma.
 * NOT: Şimdilik ödeme entegrasyonu olmadan bakiyeyi artırır (test amaçlı).
 * Faz 4'te lisanslı ödeme kuruluşuyla gerçek tahsilat sonrası tetiklenecek.
 */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const parsed = purchaseCreditsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Geçersiz miktar", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const wallet = await purchaseCredits(user.id, parsed.data.amount, "Test satın alım");
  return NextResponse.json({ ok: true, balance: wallet.balance });
}
