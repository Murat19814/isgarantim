"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, Star, ThumbsDown, CalendarCheck, CheckCircle2, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Application = {
  id: string;
  status: string;
  coverLetter: string | null;
  applicant: { id: string; fullName: string };
  cv: {
    title: string | null;
    summary: string | null;
    city: string | null;
    skills: { name: string }[];
    languages: { name: string; level: string }[];
  } | null;
};

const STATUS_LABEL: Record<string, string> = {
  APPLIED: "Başvuruldu",
  REVIEWED: "İncelendi",
  SHORTLISTED: "Ön elemede",
  INVITED: "Davet edildi",
  REJECTED: "Olumsuz",
  HIRED: "İşe alındı",
};

export function ApplicationsManager({
  postingId,
  applications,
}: {
  postingId: string;
  applications: Application[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function setStatus(applicationId: string, status: string) {
    setBusy(applicationId + status);
    try {
      await fetch(`/api/applications/${applicationId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function invite(candidateId: string) {
    const message = window.prompt("Görüşme daveti mesajı (opsiyonel):") ?? undefined;
    setBusy(candidateId + "invite");
    try {
      await fetch(`/api/job-postings/${postingId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, message }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  if (applications.length === 0) {
    return (
      <div className="card p-8 text-center text-navy-500">
        Henüz başvuru yok.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((a) => (
        <div key={a.id} className="card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-navy-800 font-display text-sm font-bold text-gold-400">
                {a.applicant.fullName.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <p className="font-semibold text-navy-900">{a.applicant.fullName}</p>
                <p className="text-xs text-navy-400">
                  {a.cv?.title ?? "CV yok"}
                  {a.cv?.city ? ` · ${a.cv.city}` : ""}
                </p>
              </div>
            </div>
            <span className="badge-navy">{STATUS_LABEL[a.status] ?? a.status}</span>
          </div>

          {a.cv?.summary && (
            <p className="mt-3 rounded-xl bg-navy-50/50 p-3 text-sm text-navy-600">
              {a.cv.summary}
            </p>
          )}

          {a.cv && (a.cv.skills.length > 0 || a.cv.languages.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {a.cv.skills.map((s, i) => (
                <span key={`s${i}`} className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                  {s.name}
                </span>
              ))}
              {a.cv.languages.map((l, i) => (
                <span key={`l${i}`} className="rounded-full bg-navy-100 px-2 py-0.5 text-xs text-navy-600">
                  {l.name} ({l.level})
                </span>
              ))}
            </div>
          )}

          {a.coverLetter && (
            <p className="mt-3 flex gap-2 text-sm text-navy-600">
              <MessageSquare className="h-4 w-4 shrink-0 text-navy-400" /> {a.coverLetter}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <ActBtn
              active={a.status === "SHORTLISTED"}
              loading={busy === a.id + "SHORTLISTED"}
              onClick={() => setStatus(a.id, "SHORTLISTED")}
              icon={<Star className="h-4 w-4" />}
              label="Ön elemeye al"
            />
            <ActBtn
              loading={busy === a.applicant.id + "invite"}
              onClick={() => invite(a.applicant.id)}
              icon={<CalendarCheck className="h-4 w-4" />}
              label="Görüşmeye davet et"
              primary
            />
            <ActBtn
              active={a.status === "HIRED"}
              loading={busy === a.id + "HIRED"}
              onClick={() => setStatus(a.id, "HIRED")}
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="İşe al"
            />
            <ActBtn
              active={a.status === "REJECTED"}
              loading={busy === a.id + "REJECTED"}
              onClick={() => setStatus(a.id, "REJECTED")}
              icon={<ThumbsDown className="h-4 w-4" />}
              label="Olumsuz"
              danger
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ActBtn({
  onClick, icon, label, loading, active, primary, danger,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  loading?: boolean;
  active?: boolean;
  primary?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
        primary
          ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
          : danger
            ? "border-red-200 text-red-600 hover:bg-red-50"
            : active
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-navy-200 text-navy-600 hover:bg-navy-50",
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {label}
    </button>
  );
}
