import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/guards";
import { approveByCustomer, WorkflowError } from "@/lib/services/workflow";

/** POST — müşteri işi onaylar (1. yıl: ödeme yok, sadece tamamlandı kaydı). */
export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  try {
    const result = await approveByCustomer(user.id, params.id);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof WorkflowError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
