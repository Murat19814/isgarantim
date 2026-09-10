import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { getSessionUser, hasRole } from "@/lib/auth/guards";
import { startJob, WorkflowError } from "@/lib/services/workflow";

/** POST — hizmet veren işe başlar (randevudan sonra). */
export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  if (!hasRole(user, UserRole.PROVIDER))
    return NextResponse.json(
      { error: "Bu işlem için 'Hizmet Veren' rolü gerekli." },
      { status: 403 },
    );

  try {
    const result = await startJob(user.id, params.id);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof WorkflowError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
