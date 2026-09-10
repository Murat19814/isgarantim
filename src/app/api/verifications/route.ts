import { NextResponse } from "next/server";
import { z } from "zod";
import { VerificationType } from "@prisma/client";
import { getSessionUser } from "@/lib/auth/guards";
import { mediaUrl } from "@/lib/validations/common";
import { submitVerification, VerificationError } from "@/lib/services/verification";

const schema = z.object({
  type: z.nativeEnum(VerificationType),
  documentUrl: mediaUrl.optional(),
  note: z.string().max(500).optional(),
});

/** POST — kullanıcı doğrulama başvurusu yükler (belge admin onayına düşer). */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Doğrulama hatası", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const res = await submitVerification(
      user.id,
      parsed.data.type,
      parsed.data.documentUrl,
      parsed.data.note,
    );
    return NextResponse.json({ ok: true, status: res.status });
  } catch (e) {
    if (e instanceof VerificationError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
