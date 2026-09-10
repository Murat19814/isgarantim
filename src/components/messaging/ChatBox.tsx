"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Send, Loader2, Lock, Unlock, Paperclip, MessageSquare, ImageIcon,
  Mic, Square, Ban, ShieldOff, FileText, AlertTriangle, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = {
  id: string;
  body: string | null;
  attachments: string[];
  isSystem: boolean;
  senderId: string;
  senderName: string;
  createdAt: string;
};

const AUDIO_EXT = /\.(weba|ogg|mp3|m4a|wav|aac)(\?|$)/i;
const VIDEO_EXT = /\.(webm|mp4|mov)(\?|$)/i;
const IMAGE_EXT = /\.(jpe?g|png|webp|gif)(\?|$)/i;

async function uploadFile(file: File): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) return null;
  const data = await res.json();
  return data.url as string;
}

export function ChatBox({
  conversationId,
  currentUserId,
  otherName,
}: {
  conversationId: string;
  currentUserId: string;
  otherName: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [contactUnlocked, setContactUnlocked] = useState(false);
  const [blockedByMe, setBlockedByMe] = useState(false);
  const [blockedByOther, setBlockedByOther] = useState(false);
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [recSecs, setRecSecs] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        setContactUnlocked(data.contactUnlocked);
        setBlockedByMe(!!data.blockedByMe);
        setBlockedByOther(!!data.blockedByOther);
      }
    } finally {
      setLoaded(true);
    }
  }, [conversationId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const disabled = blockedByMe || blockedByOther;

  async function send(extraAttachments?: string[]) {
    const body = text.trim();
    const atts = extraAttachments ?? attachments;
    if (!body && atts.length === 0) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body || undefined, attachments: atts }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setText("");
        setAttachments([]);
        await load();
      } else {
        setError(data.error ?? "Mesaj gönderilemedi.");
      }
    } finally {
      setSending(false);
    }
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadFile(file);
      if (url) setAttachments((a) => [...a, url]);
      else setError("Dosya yüklenemedi (tür/boyut).");
    } finally {
      setUploading(false);
    }
  }

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (ev) => ev.data.size > 0 && chunksRef.current.push(ev.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (recTimerRef.current) clearInterval(recTimerRef.current);
        setRecSecs(0);
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        const file = new File([blob], `ses-${Date.now()}.webm`, { type: "audio/webm" });
        setUploading(true);
        const url = await uploadFile(file);
        setUploading(false);
        if (url) await send([url]);
        else setError("Ses gönderilemedi.");
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
      setRecSecs(0);
      recTimerRef.current = setInterval(() => setRecSecs((s) => s + 1), 1000);
    } catch {
      setError("Mikrofona erişilemedi. İzin verdiğinden emin ol.");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  async function toggleBlock() {
    if (blockedByMe) {
      await fetch(`/api/conversations/${conversationId}/block`, { method: "DELETE" });
    } else {
      if (!window.confirm(`${otherName} adlı kişiyi engellemek istiyor musun? Mesajlaşma durur.`)) return;
      const reason = window.prompt("Engelleme nedeni (opsiyonel):") ?? undefined;
      await fetch(`/api/conversations/${conversationId}/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
    }
    await load();
  }

  return (
    <div className="card flex h-[520px] flex-col overflow-hidden">
      {/* Başlık */}
      <div className="flex items-center justify-between border-b border-navy-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-emerald-600" />
          <span className="font-semibold text-navy-900">{otherName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs",
              contactUnlocked ? "text-emerald-600" : "text-navy-400",
            )}
          >
            {contactUnlocked ? (
              <><Unlock className="h-3.5 w-3.5" /> İletişim açık</>
            ) : (
              <><Lock className="h-3.5 w-3.5" /> Randevu sonrası açılır</>
            )}
          </span>
          <button
            onClick={toggleBlock}
            title={blockedByMe ? "Engeli kaldır" : "Engelle"}
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              blockedByMe ? "text-emerald-600 hover:text-emerald-700" : "text-navy-400 hover:text-red-600",
            )}
          >
            {blockedByMe ? (<><ShieldOff className="h-3.5 w-3.5" /> Engeli kaldır</>) : (<><Ban className="h-3.5 w-3.5" /> Engelle</>)}
          </button>
        </div>
      </div>

      {/* Mesajlar */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-navy-50/40 p-4">
        {!loaded ? (
          <div className="flex h-full items-center justify-center text-navy-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-navy-400">
            Henüz mesaj yok. İlk mesajı sen yaz.
          </div>
        ) : (
          messages.map((m) => {
            if (m.isSystem) {
              const isWarning = m.body?.startsWith("⚠️");
              return (
                <div
                  key={m.id}
                  className={cn(
                    "mx-auto max-w-[90%] rounded-xl px-3 py-1.5 text-center text-xs",
                    isWarning
                      ? "bg-gold-50 text-gold-800 ring-1 ring-gold-200"
                      : "bg-navy-100 text-navy-500",
                  )}
                >
                  {isWarning && <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />}
                  {m.body}
                </div>
              );
            }
            const mine = m.senderId === currentUserId;
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                    mine ? "rounded-br-sm bg-emerald-600 text-white" : "rounded-bl-sm bg-white text-navy-800",
                  )}
                >
                  {m.body && <p className="whitespace-pre-line">{m.body}</p>}
                  {m.attachments.map((src, i) => (
                    <Attachment key={i} src={src} index={i} mine={mine} />
                  ))}
                  <span className={cn("mt-1 block text-[10px]", mine ? "text-white/70" : "text-navy-400")}>
                    {new Date(m.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Engel bandı */}
      {disabled && (
        <div className="flex items-center gap-2 border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700">
          <Ban className="h-3.5 w-3.5" />
          {blockedByMe
            ? "Bu kişiyi engelledin. Mesajlaşmak için engeli kaldır."
            : "Bu kişiyle mesajlaşma şu an kapalı."}
        </div>
      )}

      {/* Seçili ekler */}
      {attachments.length > 0 && !disabled && (
        <div className="flex flex-wrap gap-2 border-t border-navy-100 px-4 py-2 text-xs text-navy-500">
          {attachments.map((a, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-full bg-navy-100 px-2 py-0.5">
              <ImageIcon className="h-3 w-3" /> Ek {i + 1}
              <button onClick={() => setAttachments((arr) => arr.filter((_, j) => j !== i))}
                className="ml-1 text-navy-400 hover:text-red-600">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {error && (
        <div className="border-t border-navy-100 px-4 py-1.5 text-xs text-red-600">{error}</div>
      )}

      {/* Giriş alanı */}
      <div className="flex items-end gap-2 border-t border-navy-100 p-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,audio/*,video/*,application/pdf"
          className="hidden"
          onChange={onPickFile}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={disabled || uploading || recording}
          title="Foto/dosya ekle"
          className="btn-ghost h-10 w-10 shrink-0 p-0"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
        </button>

        {recording ? (
          <button
            onClick={stopRecording}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-red-600 px-3 text-sm font-medium text-white"
          >
            <Square className="h-4 w-4" /> {recSecs}s · Durdur
          </button>
        ) : (
          <button
            onClick={startRecording}
            disabled={disabled || uploading}
            title="Sesli mesaj"
            className="btn-ghost h-10 w-10 shrink-0 p-0"
          >
            <Mic className="h-4 w-4" />
          </button>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          disabled={disabled}
          placeholder={disabled ? "Mesajlaşma kapalı" : "Mesaj yaz..."}
          className="input max-h-28 flex-1 resize-none py-2.5 disabled:opacity-60"
        />
        <button
          onClick={() => send()}
          disabled={sending || disabled || (!text.trim() && attachments.length === 0)}
          className="btn-primary h-10 w-10 shrink-0 p-0"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function Attachment({ src, index, mine }: { src: string; index: number; mine: boolean }) {
  if (AUDIO_EXT.test(src)) {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <audio src={src} controls className="mt-1 h-9 w-full max-w-[220px]" />
    );
  }
  if (IMAGE_EXT.test(src)) {
    return (
      <a href={src} target="_blank" rel="noreferrer" className="mt-1 block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="max-h-40 rounded-lg object-cover" />
      </a>
    );
  }
  if (VIDEO_EXT.test(src)) {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video src={src} controls className="mt-1 max-h-44 w-full max-w-[240px] rounded-lg" />
    );
  }
  return (
    <a
      href={src}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "mt-1 flex items-center gap-1 text-xs underline",
        mine ? "text-white/90" : "text-emerald-700",
      )}
    >
      <FileText className="h-3.5 w-3.5" /> Dosya {index + 1}
    </a>
  );
}
