import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { getSessionUser, hasRole } from "@/lib/auth/guards";
import { deliverWorkSchema } from "@/lib/validations/service";
import { deliverWork, PaymentError } from "@/lib/services/payments";

/** POST — hizmet veren "işi tamamladım" der (not + dosya). */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  if (!hasRole(user, UserRole.PROVIDER))
    return NextResponse.json(
      { error: "Bu işlem için 'Hizmet Veren' rolü gerekli." },
      { status: 403 },
    );

  const parsed = deliverWorkSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Doğrulama hatası", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const result = await deliverWork(user.id, params.id, parsed.data);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof PaymentError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
