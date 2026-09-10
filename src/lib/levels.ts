/**
 * Başarı seviyeleri — istemci-güvenli (prisma içermez).
 * Parayla ALINAMAZ, gerçek performansla kazanılır.
 */
export const TRUST_LEVELS = [
  { key: "TOP", label: "Yılın Hizmet Vereni", minJobs: 150, minRating: 4.7, color: "gold" },
  { key: "EXPERT", label: "Uzman Profesyonel", minJobs: 75, minRating: 4.5, color: "emerald" },
  { key: "REGIONAL", label: "Bölge Ustası", minJobs: 30, minRating: 4.3, color: "emerald" },
  { key: "TRUSTED", label: "Güvenilir Profesyonel", minJobs: 10, minRating: 4.0, color: "navy" },
  { key: "ACTIVE", label: "Aktif Profesyonel", minJobs: 1, minRating: 0, color: "navy" },
  { key: "NEW", label: "Yeni Üye", minJobs: 0, minRating: 0, color: "navy" },
] as const;

export const LEVEL_LABELS: Record<string, string> = Object.fromEntries(
  TRUST_LEVELS.map((l) => [l.key, l.label]),
);

export function levelFor(completedJobs: number, ratingAvg: number) {
  return (
    TRUST_LEVELS.find((l) => completedJobs >= l.minJobs && ratingAvg >= l.minRating) ??
    TRUST_LEVELS[TRUST_LEVELS.length - 1]
  );
}

export function levelLabel(key: string) {
  return LEVEL_LABELS[key] ?? "Yeni Üye";
}
