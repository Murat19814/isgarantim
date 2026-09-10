import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/guards";
import { toggleFavorite, FavoriteError } from "@/lib/services/favorites";

/** POST — favori ekle/çıkar (toggle). */
export async function POST(_req: Request, { params }: { params: { providerId: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  try {
    const res = await toggleFavorite(user.id, params.providerId);
    return NextResponse.json({ ok: true, ...res });
  } catch (e) {
    if (e instanceof FavoriteError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
