"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Send, Loader2, Lock, Unlock, Paperclip, MessageSquare, ImageIcon,
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
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        setContactUnlocked(data.contactUnlocked);
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

  async function send() {
    const body = text.trim();
    if (!body && attachments.length === 0) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body || undefined, attachments }),
      });
      if (res.ok) {
        setText("");
        setAttachments([]);
        await load();
      }
    } finally {
      setSending(false);
    }
  }

  function addAttachment() {
    const url = window.prompt("Foto/dosya URL'si yapıştır:");
    if (url && /^https?:\/\//.test(url)) setAttachments((a) => [...a, url]);
  }

  return (
    <div className="card flex h-[520px] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-navy-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-emerald-600" />
          <span className="font-semibold text-navy-900">{otherName}</span>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs",
            contactUnlocked ? "text-emerald-600" : "text-navy-400",
          )}
        >
          {contactUnlocked ? (
            <>
              <Unlock className="h-3.5 w-3.5" /> İletişim açık
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5" /> Ödeme sonrası açılır
            </>
          )}
        </span>
      </div>

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
              return (
                <div key={m.id} className="mx-auto max-w-[85%] rounded-full bg-navy-100 px-3 py-1 text-center text-xs text-navy-500">
                  {m.body}
                </div>
              );
            }
            const mine = m.senderId === currentUserId;
            return (
              <div
                key={m.id}
                className={cn("flex", mine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                    mine
                      ? "rounded-br-sm bg-emerald-600 text-white"
                      : "rounded-bl-sm bg-white text-navy-800",
                  )}
                >
                  {m.body && <p className="whitespace-pre-line">{m.body}</p>}
                  {m.attachments.map((src, i) => (
                    <a
                      key={i}
                      href={src}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        "mt-1 flex items-center gap-1 text-xs underline",
                        mine ? "text-white/90" : "text-emerald-700",
                      )}
                    >
                      <ImageIcon className="h-3.5 w-3.5" /> Ek {i + 1}
                    </a>
                  ))}
                  <span
                    className={cn(
                      "mt-1 block text-[10px]",
                      mine ? "text-white/70" : "text-navy-400",
                    )}
                  >
                    {new Date(m.createdAt).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-navy-100 px-4 py-2 text-xs text-navy-500">
          {attachments.map((a, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-full bg-navy-100 px-2 py-0.5">
              <ImageIcon className="h-3 w-3" /> Ek {i + 1}
              <button
                onClick={() => setAttachments((arr) => arr.filter((_, j) => j !== i))}
                className="ml-1 text-navy-400 hover:text-red-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 border-t border-navy-100 p-3">
        <button
          onClick={addAttachment}
          title="Foto/dosya ekle"
          className="btn-ghost h-10 w-10 shrink-0 p-0"
        >
          <Paperclip className="h-4 w-4" />
        </button>
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
          placeholder="Mesaj yaz..."
          className="input max-h-28 flex-1 resize-none py-2.5"
        />
        <button
          onClick={send}
          disabled={sending || (!text.trim() && attachments.length === 0)}
          className="btn-primary h-10 w-10 shrink-0 p-0"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
