import {
  Phone, Mail, IdCard, MapPin, Award, Building2, UserCheck, type LucideIcon,
} from "lucide-react";
import { BADGE_LABELS } from "@/lib/badges";

const ICONS: Record<string, LucideIcon> = {
  PHONE: Phone,
  EMAIL: Mail,
  IDENTITY: IdCard,
  ADDRESS: MapPin,
  PROFESSIONAL: Award,
  COMPANY: Building2,
  REFERENCE: UserCheck,
};

/** Onaylı doğrulama rozetlerini gösterir. Belge içeriği ASLA gösterilmez. */
export function VerificationBadges({
  badges,
  size = "sm",
}: {
  badges: Record<string, boolean>;
  size?: "sm" | "md";
}) {
  const active = Object.entries(badges).filter(([, v]) => v);
  if (active.length === 0) return null;

  const dim = size === "md" ? "text-sm px-2.5 py-1" : "text-xs px-2 py-0.5";
  const icon = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <div className="flex flex-wrap gap-1.5">
      {active.map(([key]) => {
        const Icon = ICONS[key] ?? UserCheck;
        return (
          <span
            key={key}
            title={BADGE_LABELS[key]}
            className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 font-medium text-emerald-700 ${dim}`}
          >
            <Icon className={icon} /> {BADGE_LABELS[key]}
          </span>
        );
      })}
    </div>
  );
}
