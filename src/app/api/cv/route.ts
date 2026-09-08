import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/guards";
import { cvSchema } from "@/lib/validations/jobs";
import { getCV, saveCV } from "@/lib/services/cv";

/** GET — kullanıcının CV'si. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  const cv = await getCV(user.id);
  return NextResponse.json({ cv });
}

/** PUT — CV'yi tümüyle kaydet. */
export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const parsed = cvSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Doğrulama hatası", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const cv = await saveCV(user.id, parsed.data);
  return NextResponse.json({ ok: true, id: cv.id });
}
