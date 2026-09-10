import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MapPin, Calendar, Wallet } from "lucide-react";
import { auth } from "@/lib/auth/session";
import {
  getRequestWithOffers,
  getRequestWorkflow,
} from "@/lib/services/serviceRequests";
import { getReviewForRequest } from "@/lib/services/reviews";
import { getOrCreateConversationForRequest } from "@/lib/services/messaging";
import { formatTRY } from "@/lib/utils";
import { OfferComparison } from "@/components/service/OfferComparison";
import { RequestWorkflow } from "@/components/service/RequestWorkflow";
import { ChatBox } from "@/components/messaging/ChatBox";

export const metadata = { title: "Talep Detayı" };

export default async function Page({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/giris");

  const request = await getRequestWithOffers(params.id);
  if (!request) notFound();
  if (request.customer.id !== session.user.id) redirect("/panel/hizmet-al");

  const isOpen = request.status === "OPEN";
  const selectable = isOpen;

  // Teklif seçildikten sonra: iş akışı + konuşma
  const workflow = isOpen ? null : await getRequestWorkflow(params.id);
  const winner = workflow?.offers[0] ?? null;

  let conversationId: string | null = null;
  if (workflow && winner) {
    const convo = await getOrCreateConversationForRequest(
      params.id,
      session.user.id,
    ).catch(() => null);
    conversationId = convo?.id ?? null;
  }

  // Tamamlanan işlerde mevcut değerlendirmeyi getir.
  const existingReview =
    workflow?.status === "COMPLETED"
      ? await getReviewForRequest(params.id)
      : null;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/panel/hizmet-al"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-800"
      >
        <ArrowLeft className="h-4 w-4" /> Taleplerime dön
      </Link>

      <div className="card p-6">
        <span className="badge-navy">{request.category.name}</span>
        <h1 className="mt-3 font-display text-2xl font-extrabold text-navy-900">
          {request.title}
        </h1>
        <p className="mt-3 whitespace-pre-line text-navy-600">{request.description}</p>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-navy-500">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> {request.city}
            {request.district ? ` / ${request.district}` : ""}
          </span>
          {(request.budgetMin || request.budgetMax) && (
            <span className="inline-flex items-center gap-1.5">
              <Wallet className="h-4 w-4" />
              {request.budgetMin ? formatTRY(request.budgetMin) : "?"} -{" "}
              {request.budgetMax ? formatTRY(request.budgetMax) : "?"}
            </span>
          )}
          {request.preferredDate && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(request.preferredDate).toLocaleDateString("tr-TR")}
            </span>
          )}
        </div>

        {request.photos.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {request.photos.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt=""
                className="h-24 w-full rounded-xl border border-navy-100 object-cover"
              />
            ))}
          </div>
        )}
      </div>

      {/* İş akışı (teklif seçildikten sonra) — 1. yıl emanetsiz */}
      {workflow && workflow.payment && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <RequestWorkflow
            requestId={request.id}
            status={workflow.status}
            agreedPrice={workflow.agreedPrice ?? workflow.payment.amount}
            scheduledAt={workflow.scheduledAt ? workflow.scheduledAt.toISOString() : null}
            delivery={
              workflow.payment.delivery
                ? {
                    note: workflow.payment.delivery.note,
                    files: workflow.payment.delivery.files,
                    deliveredAt: workflow.payment.delivery.deliveredAt
                      ? workflow.payment.delivery.deliveredAt.toISOString()
                      : null,
                    approvedAt: workflow.payment.delivery.approvedAt
                      ? workflow.payment.delivery.approvedAt.toISOString()
                      : null,
                  }
                : null
            }
            provider={
              winner
                ? {
                    fullName: winner.provider.fullName,
                    phone: winner.provider.phone,
                    email: winner.provider.email,
                    headline: winner.provider.providerProfile?.headline ?? null,
                  }
                : null
            }
            contactUnlocked={workflow.conversation?.contactUnlocked ?? false}
            existingReview={
              existingReview
                ? { rating: existingReview.rating, comment: existingReview.comment }
                : null
            }
          />

          {conversationId ? (
            <ChatBox
              conversationId={conversationId}
              currentUserId={session.user.id}
              otherName={winner?.provider.fullName ?? "Hizmet veren"}
            />
          ) : (
            <div className="card grid place-items-center p-6 text-center text-sm text-navy-400">
              Mesajlaşma teklif seçildikten sonra açılır.
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-4 font-display text-xl font-bold text-navy-900">
          {isOpen ? `Gelen teklifler (${request.offers.length})` : "Teklifler"}
        </h2>
        <OfferComparison
          requestId={request.id}
          offers={request.offers}
          selectable={selectable}
        />
      </div>
    </div>
  );
}
