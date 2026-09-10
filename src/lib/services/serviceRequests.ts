import { ServiceRequestStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ServiceRequestInput } from "@/lib/validations/service";

export class WorkPhotoError extends Error {}

/**
 * Kazanan hizmet veren, iş öncesi/sonrası fotoğraflarını kaydeder.
 * Yalnızca işi kazanan hizmet veren güncelleyebilir.
 */
export async function setWorkPhotos(
  providerId: string,
  requestId: string,
  input: { beforePhotos?: string[]; afterPhotos?: string[] },
) {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    select: { id: true, payment: { select: { providerId: true } } },
  });
  if (!request) throw new WorkPhotoError("Talep bulunamadı.");
  if (request.payment?.providerId !== providerId)
    throw new WorkPhotoError("Bu işe fotoğraf ekleyemezsin.");

  return prisma.serviceRequest.update({
    where: { id: requestId },
    data: {
      ...(input.beforePhotos ? { beforePhotos: input.beforePhotos.slice(0, 8) } : {}),
      ...(input.afterPhotos ? { afterPhotos: input.afterPhotos.slice(0, 8) } : {}),
    },
    select: { beforePhotos: true, afterPhotos: true },
  });
}

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
      neighborhood: input.neighborhood,
      title: input.title,
      description: input.description,
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
      preferredDate: input.preferredDate ? new Date(input.preferredDate) : null,
      urgency: input.urgency,
      locationType: input.locationType,
      contactPreference: input.contactPreference,
      photos: input.photos ?? [],
      videos: input.videos ?? [],
      voiceNote: input.voiceNote,
      invitedProviderId: input.invitedProviderId || null,
      isEmergency: input.isEmergency ?? false,
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

/**
 * Talebin emanet/iş akışı verisi (ödeme, teslim, itiraz, konuşma, kazanan iletişim).
 * Hem müşteri hem hizmet veren detay sayfası kullanır.
 */
export async function getRequestWorkflow(requestId: string) {
  return prisma.serviceRequest.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      title: true,
      status: true,
      customerId: true,
      scheduledAt: true,
      agreedPrice: true,
      startedAt: true,
      completedAt: true,
      customer: { select: { id: true, fullName: true, phone: true, email: true } },
      payment: {
        select: {
          id: true,
          amount: true,
          platformFee: true,
          status: true,
          approvalDeadline: true,
          releasedAt: true,
          providerId: true,
          delivery: {
            select: {
              note: true,
              files: true,
              deliveredAt: true,
              approvedAt: true,
            },
          },
        },
      },
      dispute: { select: { reason: true, status: true, openedById: true } },
      conversation: { select: { id: true, contactUnlocked: true } },
      offers: {
        where: { status: "WON" },
        select: {
          providerId: true,
          price: true,
          provider: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              email: true,
              providerProfile: { select: { headline: true } },
            },
          },
        },
      },
    },
  });
}

/** Hizmet verenin kazandığı (aktif/tamamlanan) işler. */
export async function listProviderActiveJobs(providerId: string) {
  return prisma.offer.findMany({
    where: { providerId, status: "WON" },
    orderBy: { updatedAt: "desc" },
    include: {
      serviceRequest: {
        select: {
          id: true,
          title: true,
          city: true,
          district: true,
          status: true,
          category: { select: { name: true } },
          payment: { select: { status: true, amount: true } },
        },
      },
    },
  });
}

/** Hizmet veren için talep detayı (kendi teklifi + iş akışı). */
export async function getRequestForProvider(
  requestId: string,
  providerId: string,
) {
  return prisma.serviceRequest.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      title: true,
      description: true,
      city: true,
      district: true,
      neighborhood: true,
      photos: true,
      videos: true,
      voiceNote: true,
      beforePhotos: true,
      afterPhotos: true,
      urgency: true,
      locationType: true,
      contactPreference: true,
      status: true,
      category: { select: { name: true } },
      offers: {
        where: { providerId },
        select: { id: true, price: true, status: true, estimatedDuration: true },
      },
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
              emailVerified: true,
              phoneVerified: true,
              verifications: {
                where: { status: "APPROVED" },
                select: { type: true },
              },
              providerProfile: {
                select: {
                  ratingAvg: true,
                  ratingCount: true,
                  completedJobs: true,
                  identityVerified: true,
                  skillVerified: true,
                  avgResponseMin: true,
                  headline: true,
                  experienceYears: true,
                  city: true,
                  trustScore: true,
                  level: true,
                },
              },
            },
          },
        },
      },
    },
  });
}
