import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { getSessionUser, hasRole } from "@/lib/auth/guards";
import { candidateFilterSchema } from "@/lib/validations/jobs";
import { filterCandidates } from "@/lib/services/jobs";

/** GET — görünür CV'ler arasında aday filtreleme (işveren). */
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  if (!hasRole(user, UserRole.EMPLOYER))
    return NextResponse.json(
      { error: "Bu işlem için 'İşveren' rolü gerekli." },
      { status: 403 },
    );

  const { searchParams } = new URL(req.url);
  const parsed = candidateFilterSchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    city: searchParams.get("city") ?? undefined,
    minExperience: searchParams.get("minExperience") ?? undefined,
    educationLevel: searchParams.get("educationLevel") ?? undefined,
    language: searchParams.get("language") ?? undefined,
    skill: searchParams.get("skill") ?? undefined,
  });
  const filter = parsed.success ? parsed.data : {};
  const candidates = await filterCandidates(filter);
  return NextResponse.json({ candidates });
}
