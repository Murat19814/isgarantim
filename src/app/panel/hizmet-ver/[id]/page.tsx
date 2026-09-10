import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { auth } from "@/lib/auth/session";
import {
  getRequestForProvider,
  getRequestWorkflow,
} from "@/lib/services/serviceRequests";
import { getOrCreateConversationForRequest } from "@/lib/services/messaging";
import { getReviewForRequest } from "@/lib/services/reviews";
import { ProviderWorkflow } from "@/components/provider/ProviderWorkflow";
import { ChatBox } from "@/components/messaging/ChatBox";

export const metadata = { title: "İş Detayı" };

export default async function Page({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/hizmet-ver");

  const request = await getRequestForProvider(params.id, session.user.id);
  if (!request) notFound();

  const myOffer = request.offers[0] ?? null;
  if (!myOffer || myOffer.status !== "WON") redirect("/panel/hizmet-ver");

  const workflow = await getRequestWorkflow(params.id);
  if (!workflow?.payment || workflow.payment.providerId !== session.user.id)
    redirect("/panel/hizmet-ver");

  const convo = await getOrCreateConversationForRequest(
    params.id,
    session.user.id,
  ).catch(() => null);

  const review =
    workflow.status === "COMPLETED" ? await getReviewForRequest(params.id) : null;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/panel/hizmet-ver"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-800"
      >
        <ArrowLeft className="h-4 w-4" /> Panele dön
      </Link>

      <div className="card p-6">
        <span className="badge-navy">{request.category.name}</span>
        <h1 className="mt-3 font-display text-2xl font-extrabold text-navy-900">
          {request.title}
        </h1>
        <p className="mt-3 whitespace-pre-line text-navy-600">
          {request.description}
        </p>
        <div className="mt-4 text-sm text-navy-500">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> {request.city}
            {request.district ? ` / ${request.district}` : ""}
          </span>
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

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ProviderWorkflow
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
          customer={{
            fullName: workflow.customer.fullName,
            phone: workflow.customer.phone,
            email: workflow.customer.email,
          }}
          contactUnlocked={workflow.conversation?.contactUnlocked ?? false}
          review={
            review
              ? {
                  id: review.id,
                  rating: review.rating,
                  comment: review.comment,
                  providerReply: review.providerReply,
                }
              : null
          }
        />

        {convo ? (
          <ChatBox
            conversationId={convo.id}
            currentUserId={session.user.id}
            otherName={workflow.customer.fullName}
          />
        ) : (
          <div className="card grid place-items-center p-6 text-center text-sm text-navy-400">
            Mesajlaşma yüklenemedi.
          </div>
        )}
      </div>
    </div>
  );
}
