import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { getSessionUser, hasRole } from "@/lib/auth/guards";
import { companySchema } from "@/lib/validations/jobs";
import { getMyCompany, upsertCompany } from "@/lib/services/companies";

/** GET — kullanıcının firması. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  const company = await getMyCompany(user.id);
  return NextResponse.json({ company });
}

/** PUT — firma oluştur/güncelle. */
export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  if (!hasRole(user, UserRole.EMPLOYER))
    return NextResponse.json(
      { error: "Bu işlem için 'İşveren' rolü gerekli." },
      { status: 403 },
    );

  const parsed = companySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Doğrulama hatası", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const company = await upsertCompany(user.id, parsed.data);
  return NextResponse.json({ ok: true, id: company.id });
}
