import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getSessionUser } from "@/lib/auth/guards";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// Diske yazacağımız için Node runtime şart (Edge değil).
export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB (ses/video için)
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
  // Sesli mesaj / ses kayıtları
  "audio/webm": "weba",
  "audio/ogg": "ogg",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/aac": "aac",
  // Kısa video
  "video/mp4": "mp4",
  "video/webm": "webm",
};

/**
 * POST /api/upload — multipart form-data ("file" alanı).
 * Dosyayı public/uploads altına kaydeder ve erişilebilir URL döner.
 * Not: Şu an sunucu diskine yazıyoruz. İleride CLOUDINARY_URL / S3
 * env'i tanımlanınca bu handler bulut sağlayıcıya yönlendirilebilir.
 */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  // Yükleme suistimalini önle: kullanıcı başına dakikada 20 dosya.
  const rl = rateLimit(`upload:${user.id}:${clientIp(req)}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Çok fazla yükleme. Lütfen biraz bekle." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
  }

  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Sadece JPG, PNG, WEBP, GIF veya PDF yükleyebilirsin." },
      { status: 415 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Dosya en fazla 5 MB olabilir." },
      { status: 413 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}.${ext}`;
  await writeFile(path.join(dir, filename), bytes);

  return NextResponse.json({
    url: `/uploads/${filename}`,
    name: file.name,
    type: file.type,
    size: file.size,
  });
}
