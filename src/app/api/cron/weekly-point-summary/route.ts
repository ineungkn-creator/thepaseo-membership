import { NextResponse } from "next/server";
import { PrismaClient, PointType } from "@prisma/client";
import { sendLineWeeklyPointSummary } from "@/lib/lineNotifyWeekly";

const prisma = new PrismaClient();

export async function GET() {
  const now = new Date();

  // 🇹🇭 เวลาไทย
  const end = new Date(now);
  const start = new Date(now);
  start.setDate(end.getDate() - 7);

  const transactions = await prisma.pointTransaction.findMany({
    where: {
      createdAt: {
        gte: start,
        lt: end,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          lineId: true,
          name: true,
        },
      },
    },
  });

  const grouped = new Map<string, any>();

  for (const tx of transactions) {
    if (!tx.user?.lineId) continue;

    if (!grouped.has(tx.userId)) {
      grouped.set(tx.userId, {
        user: tx.user,
        received: 0,
        used: 0,
      });
    }

    const g = grouped.get(tx.userId);

    if (tx.type === PointType.RECEIPT) {
      g.received += tx.amount;
    }

    if (
      tx.type === PointType.REDEEM ||
      tx.type === PointType.ADJUST && tx.amount < 0
    ) {
      g.used += Math.abs(tx.amount);
    }
  }

  for (const [userId, data] of grouped) {
    if (data.received === 0 && data.used === 0) continue;

    const balance = await prisma.pointBalance.findUnique({
      where: { userId },
    });

    await sendLineWeeklyPointSummary({
      userId,
      lineId: data.user.lineId,
      name: data.user.name,
      received: data.received,
      used: data.used,
      balance: balance?.balance || 0,
      updatedAt: end,
    });
  }

  return NextResponse.json({ success: true });
}
