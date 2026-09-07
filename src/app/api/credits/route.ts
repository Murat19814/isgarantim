import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/guards";
import { getOrCreateWallet } from "@/lib/services/credits";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const wallet = await getOrCreateWallet(user.id);
  const transactions = await prisma.creditTransaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    balance: wallet.balance,
    heldBalance: wallet.heldBalance,
    transactions,
  });
}
