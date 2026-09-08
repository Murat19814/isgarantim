import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { getSessionUser, hasRole } from "@/lib/auth/guards";
import { jobPostingSchema, jobFilterSchema } from "@/lib/validations/jobs";
import { createJobPosting, listJobPostings, JobError } from "@/lib/services/jobs";

/** GET — herkese açık ilan listesi (filtreli). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = jobFilterSchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    city: searchParams.get("city") ?? undefined,
    categoryId: searchParams.get("categoryId") ?? undefined,
    workType: searchParams.get("workType") ?? undefined,
  });
  const filter = parsed.success ? parsed.data : {};
  const postings = await listJobPostings(filter);
  return NextResponse.json({ postings });
}

/** POST — yeni ilan yayınla (işveren, ilan hakkı tüketir). */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  if (!hasRole(user, UserRole.EMPLOYER))
    return NextResponse.json(
      { error: "Bu işlem için 'İşveren' rolü gerekli." },
      { status: 403 },
    );

  const parsed = jobPostingSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Doğrulama hatası", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const posting = await createJobPosting(user.id, parsed.data);
    return NextResponse.json({ ok: true, id: posting.id }, { status: 201 });
  } catch (e) {
    if (e instanceof JobError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
