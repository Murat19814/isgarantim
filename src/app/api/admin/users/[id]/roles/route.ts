import { NextResponse } from "next/server";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { getSessionUser, isAdmin } from "@/lib/auth/guards";
import { setUserRoles, AdminError } from "@/lib/services/admin";

const schema = z.object({
  roles: z.array(z.enum(["CUSTOMER", "PROVIDER", "JOBSEEKER", "EMPLOYER", "ADMIN"])).min(1),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!isAdmin(user)) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz roller." }, { status: 422 });

  try {
    const res = await setUserRoles(params.id, parsed.data.roles as UserRole[]);
    return NextResponse.json({ ok: true, roles: res.roles });
  } catch (e) {
    if (e instanceof AdminError) return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
