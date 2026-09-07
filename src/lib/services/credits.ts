import { Prisma, CreditTxType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * KONTÖR (ESCROW) MOTORU
 * ──────────────────────
 * Cüzdan iki bakiye tutar:
 *   - balance      : kullanılabilir kontör
 *   - heldBalance  : teklif için rezerve edilmiş (beklemedeki) kontör
 *
 * Akış:
 *   PURCHASE : balance += tutar
 *   HOLD     : teklif verilince  balance -> heldBalance (rezerve)
 *   CAPTURE  : teklif kazanınca   heldBalance kesin düşülür (harcanır)
 *   REFUND   : teklif kaybedince/geri çekilince heldBalance -> balance (iade)
 *
 * Tüm mutasyonlar defter kaydı (CreditTransaction) ile birlikte,
 * atomik transaction içinde yapılır.
 */

export class InsufficientCreditsError extends Error {
  constructor(message = "Yetersiz kontör bakiyesi.") {
    super(message);
    this.name = "InsufficientCreditsError";
  }
}

type Tx = Prisma.TransactionClient;

/** Kullanıcının cüzdanını getirir; yoksa oluşturur. */
export async function getOrCreateWallet(userId: string) {
  return prisma.creditWallet.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

async function writeLedger(
  tx: Tx,
  walletId: string,
  type: CreditTxType,
  amount: number,
  balanceAfter: number,
  offerId?: string,
  note?: string,
) {
  await tx.creditTransaction.create({
    data: { walletId, type, amount, balanceAfter, offerId, note },
  });
}

/** Kontör satın alımı (Faz 4'te gerçek ödemeyle tetiklenir). */
export async function purchaseCredits(userId: string, amount: number, note?: string) {
  if (amount <= 0) throw new Error("Geçersiz kontör miktarı.");
  return prisma.$transaction(async (tx) => {
    const wallet = await tx.creditWallet.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
    const updated = await tx.creditWallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amount } },
    });
    await writeLedger(
      tx,
      wallet.id,
      CreditTxType.PURCHASE,
      amount,
      updated.balance,
      undefined,
      note ?? "Kontör satın alındı",
    );
    return updated;
  });
}

/**
 * Teklif için kontör rezerve eder (balance -> heldBalance).
 * Verilen transaction client içinde çalışır (teklif oluşturmayla aynı atomik blok).
 */
export async function holdCreditsTx(
  tx: Tx,
  userId: string,
  amount: number,
  offerId?: string,
) {
  const wallet = await tx.creditWallet.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
  if (wallet.balance < amount) {
    throw new InsufficientCreditsError(
      `Bu teklif için ${amount} kontör gerekli, bakiyen ${wallet.balance}.`,
    );
  }
  const updated = await tx.creditWallet.update({
    where: { id: wallet.id },
    data: {
      balance: { decrement: amount },
      heldBalance: { increment: amount },
    },
  });
  await writeLedger(
    tx,
    wallet.id,
    CreditTxType.HOLD,
    -amount,
    updated.balance,
    offerId,
    "Teklif için beklemeye alındı",
  );
  return updated;
}

/** Kazanan teklifin rezerve kontörünü kesin olarak düşer. */
export async function captureCreditsTx(
  tx: Tx,
  userId: string,
  amount: number,
  offerId?: string,
) {
  const wallet = await tx.creditWallet.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
  const updated = await tx.creditWallet.update({
    where: { id: wallet.id },
    data: { heldBalance: { decrement: amount } },
  });
  await writeLedger(
    tx,
    wallet.id,
    CreditTxType.CAPTURE,
    -amount,
    updated.balance,
    offerId,
    "Teklif kazanıldı — kontör kesildi",
  );
  return updated;
}

/** Kaybeden/geri çekilen teklifin rezerve kontörünü iade eder (heldBalance -> balance). */
export async function refundCreditsTx(
  tx: Tx,
  userId: string,
  amount: number,
  offerId?: string,
) {
  const wallet = await tx.creditWallet.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
  const updated = await tx.creditWallet.update({
    where: { id: wallet.id },
    data: {
      heldBalance: { decrement: amount },
      balance: { increment: amount },
    },
  });
  await writeLedger(
    tx,
    wallet.id,
    CreditTxType.REFUND,
    amount,
    updated.balance,
    offerId,
    "Teklif kazanılamadı — kontör iade edildi",
  );
  return updated;
}
