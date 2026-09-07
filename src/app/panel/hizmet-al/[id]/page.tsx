import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MapPin, Calendar, Wallet } from "lucide-react";
import { auth } from "@/lib/auth/session";
import { getRequestWithOffers } from "@/lib/services/serviceRequests";
import { formatTRY } from "@/lib/utils";
import { OfferComparison } from "@/components/service/OfferComparison";

export const metadata = { title: "Talep Detayı" };

export default async function Page({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/giris");

  const request = await getRequestWithOffers(params.id);
  if (!request) notFound();
  if (request.customer.id !== session.user.id) redirect("/panel/hizmet-al");

  const selectable = request.status === "OPEN";

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

      <div className="mt-8">
        <h2 className="mb-4 font-display text-xl font-bold text-navy-900">
          Gelen teklifler ({request.offers.length})
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
