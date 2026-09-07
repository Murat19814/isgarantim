import { ServiceRequestStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ServiceRequestInput } from "@/lib/validations/service";

/** Müşteri yeni hizmet talebi oluşturur. */
export async function createServiceRequest(
  customerId: string,
  input: ServiceRequestInput,
) {
  return prisma.serviceRequest.create({
    data: {
      customerId,
      categoryId: input.categoryId,
      subCategory: input.subCategory,
      city: input.city,
      district: input.district,
      title: input.title,
      description: input.description,
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
      preferredDate: input.preferredDate ? new Date(input.preferredDate) : null,
      photos: input.photos ?? [],
      status: ServiceRequestStatus.OPEN,
    },
  });
}

/** Müşterinin kendi talepleri. */
export async function listCustomerRequests(customerId: string) {
  return prisma.serviceRequest.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      _count: { select: { offers: true } },
    },
  });
}

/** Hizmet verenler için açık talepler (opsiyonel şehir/kategori filtresi). */
export async function listOpenRequests(filter?: {
  city?: string;
  categoryId?: string;
}) {
  return prisma.serviceRequest.findMany({
    where: {
      status: ServiceRequestStatus.OPEN,
      ...(filter?.city ? { city: filter.city } : {}),
      ...(filter?.categoryId ? { categoryId: filter.categoryId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      _count: { select: { offers: true } },
    },
  });
}

/** Talep detayı + teklifler (teklif verenlerin profil bilgileriyle). */
export async function getRequestWithOffers(requestId: string) {
  return prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: {
      category: true,
      customer: { select: { id: true, fullName: true } },
      offers: {
        orderBy: { price: "asc" },
        include: {
          provider: {
            select: {
              id: true,
              fullName: true,
              providerProfile: {
                select: {
                  ratingAvg: true,
                  ratingCount: true,
                  completedJobs: true,
                  identityVerified: true,
                  skillVerified: true,
                  avgResponseMin: true,
                  headline: true,
                },
              },
            },
          },
        },
      },
    },
  });
}
