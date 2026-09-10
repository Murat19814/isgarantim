import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/guards";
import { agreementSchema } from "@/lib/validations/service";
import {
  upsertAgreement,
  approveAgreement,
  AgreementError,
} from "@/lib/services/agreements";

/** POST — anlaşma taslağı oluştur/güncelle. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = agreementSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Geçersiz veri." },
      { status: 400 },
    );

  try {
    const agreement = await upsertAgreement(user.id, params.id, parsed.data);
    return NextResponse.json({ ok: true, agreement });
  } catch (e) {
    if (e instanceof AgreementError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}

/** PATCH — anlaşmayı onayla. */
export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  try {
    const agreement = await approveAgreement(user.id, params.id);
    return NextResponse.json({ ok: true, agreement });
  } catch (e) {
    if (e instanceof AgreementError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
