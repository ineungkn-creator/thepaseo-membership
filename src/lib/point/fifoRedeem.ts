import { Prisma } from "@prisma/client";

export async function redeemPointsFIFO({
  tx,
  userId,
  amount,
}: {
  tx: Prisma.TransactionClient; // ✅ ถูก
  userId: string;
  amount: number;
}) {
  // 1. ดึง wallet ที่ยังไม่หมดอายุ + ยังมีแต้ม
  const wallets = await tx.pointWallet.findMany({
    where: {
      userId,
      points: { gt: 0 },
      usedPoints: { lt: tx.pointWallet.fields.points },
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    orderBy: [
      { expiresAt: "asc" },
      { createdAt: "asc" },
    ],
  });

  let remaining = amount;

  for (const wallet of wallets) {
    if (remaining <= 0) break;

    const available = wallet.points - wallet.usedPoints;
    const toUse = Math.min(available, remaining);

    await tx.pointWallet.update({
      where: { id: wallet.id },
      data: {
        usedPoints: { increment: toUse },
      },
    });

    remaining -= toUse;
  }

  if (remaining > 0) {
    throw new Error("PointWallet balance not enough (FIFO)");
  }
}
