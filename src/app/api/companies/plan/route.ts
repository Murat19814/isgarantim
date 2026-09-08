import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/guards";
import { purchasePlanSchema } from "@/lib/validations/jobs";
import { purchasePlan, CompanyError } from "@/lib/services/companies";

/** POST — ilan planı satın al (mock ödeme). */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const parsed = purchasePlanSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Geçersiz plan." }, { status: 422 });

  try {
    const sub = await purchasePlan(user.id, parsed.data.planId);
    return NextResponse.json({ ok: true, quota: sub.postQuota });
  } catch (e) {
    if (e instanceof CompanyError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
