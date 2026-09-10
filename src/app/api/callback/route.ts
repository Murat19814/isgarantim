import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import { callbackSchema } from "@/lib/validations/service";
import { createCallback } from "@/lib/services/callback";

/** POST — "Beni arayın" geri arama talebi (girişsiz de olabilir). */
export async function POST(req: Request) {
  const parsed = callbackSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Doğrulama hatası", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const session = await auth();
  await createCallback(parsed.data, session?.user?.id ?? null);

  return NextResponse.json({ ok: true }, { status: 201 });
}
