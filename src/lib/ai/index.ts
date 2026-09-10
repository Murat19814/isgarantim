/**
 * Env-gated AI yardımcısı.
 * OPENAI_API_KEY tanımlı değilse tüm fonksiyonlar null döner ve sistem
 * sezgisel (heuristic) yönteme geri düşer. Böylece anahtar olmadan da çalışır,
 * anahtar eklenince otomatik olarak akıllı hale gelir.
 */

const API_KEY = process.env.OPENAI_API_KEY;
const BASE = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";

export function aiEnabled(): boolean {
  return !!API_KEY;
}

/** JSON döndüren sohbet çağrısı. Hata/anahtar yoksa null. */
export async function chatJSON<T = Record<string, unknown>>(
  system: string,
  user: string,
): Promise<T | null> {
  if (!API_KEY) return null;
  try {
    const res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

/** Görsel + metin ile JSON döndüren çağrı (vision). Hata/anahtar yoksa null. */
export async function visionJSON<T = Record<string, unknown>>(
  system: string,
  user: string,
  imageUrl: string,
): Promise<T | null> {
  if (!API_KEY) return null;
  try {
    const res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: [
              { type: "text", text: user },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

/** Ses dosyasını (URL) metne çevirir (whisper). Hata/anahtar yoksa null. */
export async function transcribeAudio(url: string): Promise<string | null> {
  if (!API_KEY) return null;
  try {
    const audioRes = await fetch(url);
    if (!audioRes.ok) return null;
    const blob = await audioRes.blob();
    const fd = new FormData();
    fd.append("file", blob, "audio.webm");
    fd.append("model", process.env.OPENAI_STT_MODEL ?? "whisper-1");
    fd.append("language", "tr");
    const res = await fetch(`${BASE}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}` },
      body: fd,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.text === "string" ? data.text : null;
  } catch {
    return null;
  }
}
