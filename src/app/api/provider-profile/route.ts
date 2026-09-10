import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { getSessionUser, hasRole } from "@/lib/auth/guards";
import { providerProfileSchema } from "@/lib/validations/profile";
import { upsertProviderProfile } from "@/lib/services/providerProfile";

/** POST — hizmet veren profilini oluşturur/günceller. */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  if (!hasRole(user, UserRole.PROVIDER))
    return NextResponse.json(
      { error: "Profil için 'Hizmet Veren' rolü gerekli." },
      { status: 403 },
    );

  const parsed = providerProfileSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Doğrulama hatası", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const res = await upsertProviderProfile(user.id, parsed.data);
  return NextResponse.json({ ok: true, id: res.id });
}
