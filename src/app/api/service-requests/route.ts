import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/guards";
import { serviceRequestSchema } from "@/lib/validations/service";
import {
  createServiceRequest,
  listCustomerRequests,
  listOpenRequests,
} from "@/lib/services/serviceRequests";
import { notifyMatchingProviders } from "@/lib/services/matching";

/** GET ?scope=mine (müşteri talepleri) | open (hizmet verenler için açık talepler) */
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") ?? "mine";

  if (scope === "open") {
    const city = searchParams.get("city") ?? undefined;
    const categoryId = searchParams.get("categoryId") ?? undefined;
    const data = await listOpenRequests({ city, categoryId });
    return NextResponse.json({ data });
  }

  const data = await listCustomerRequests(user.id);
  return NextResponse.json({ data });
}

/** POST — yeni hizmet talebi (hizmet alan). */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const parsed = serviceRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Doğrulama hatası", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const request = await createServiceRequest(user.id, parsed.data);

  // Eşleşen hizmet verenlere bildirim (akış bozulmasın diye hata yutulur).
  notifyMatchingProviders(request.id).catch((e) =>
    console.error("[notifyMatchingProviders] başarısız:", e),
  );

  return NextResponse.json({ ok: true, id: request.id }, { status: 201 });
}
