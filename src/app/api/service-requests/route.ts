import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/guards";
import { serviceRequestSchema } from "@/lib/validations/service";
import {
  createServiceRequest,
  listCustomerRequests,
  listOpenRequests,
} from "@/lib/services/serviceRequests";
import { notifyMatchingProviders, notifyEmergencyProviders } from "@/lib/services/matching";
import { notify } from "@/lib/services/notifications";

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

  // "Tekrar çağır": davet edilen ustaya özel bildirim.
  if (parsed.data.invitedProviderId && parsed.data.invitedProviderId !== user.id) {
    notify(parsed.data.invitedProviderId, {
      type: "RECALL_INVITE",
      title: "Bir müşteri seni tekrar çağırdı 🎯",
      body: "Daha önce çalıştığın bir müşteri yeni bir talep açtı ve seni davet etti. Teklif verebilirsin.",
      link: `/panel/hizmet-ver`,
    }).catch(() => {});
  }

  // Acil talep: aynı gün müsait + yakın ustalara öncelikli bildirim.
  if (parsed.data.isEmergency) {
    notifyEmergencyProviders(request.id).catch((e) =>
      console.error("[notifyEmergencyProviders] başarısız:", e),
    );
  }

  // Eşleşen hizmet verenlere bildirim (akış bozulmasın diye hata yutulur).
  notifyMatchingProviders(request.id).catch((e) =>
    console.error("[notifyMatchingProviders] başarısız:", e),
  );

  return NextResponse.json({ ok: true, id: request.id }, { status: 201 });
}
