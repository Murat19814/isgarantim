import { listReportedReviews } from "@/lib/services/reviews";
import { ReviewModerator, type ReportedReviewRow } from "@/components/admin/ReviewModerator";

export const metadata = { title: "Şikayet Edilen Yorumlar — Admin" };

export default async function Page() {
  const items = await listReportedReviews();

  const rows: ReportedReviewRow[] = items.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    reportReason: r.reportReason,
    isHidden: r.isHidden,
    createdAt: r.createdAt.toISOString().slice(0, 16).replace("T", " "),
    authorName: r.author.fullName,
    targetName: r.target.fullName,
  }));

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900">Şikayet Edilen Yorumlar</h1>
      <p className="mt-1 text-sm text-navy-500">
        Haksız/uygunsuz olarak bildirilen yorumları incele; gerekirse gizle.
      </p>
      <div className="mt-6">
        <ReviewModerator rows={rows} />
      </div>
    </div>
  );
}
