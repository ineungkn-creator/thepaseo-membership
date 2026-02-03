import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";

const prisma = new PrismaClient();

/* ============================================================
   ✅ GET /api/reward/[id]
   ดูข้อมูล Reward + สถานะของผู้ใช้ (NO SIDE EFFECT)
============================================================ */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);
    const userId = session?.user?.id || null;

    const reward = await prisma.reward.findUnique({
      where: { id },
      include: {
        shops: true,
        branches: true,
        _count: { select: { participations: true } },
      },
    });

    if (!reward) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    /* ==============================
       สถานะ reward
    ============================== */
    const now = new Date();
    const isExpired = reward.endDate < now;
    const isFull =
      reward.quantity !== null &&
      reward._count.participations >= reward.quantity;

    /* ==============================
       point balance ของ user
    ============================== */
    let userPointBalance = 0;
    if (userId) {
      const balance = await prisma.pointBalance.findUnique({
        where: { userId },
      });
      userPointBalance = balance?.balance ?? 0;
    }

    /* ==============================
       การแลกของ user
    ============================== */
    let joinedCountByUser = 0;
    let hasJoined = false;
    let reachedLimit = false;

    if (userId) {
      joinedCountByUser = await prisma.rewardParticipation.count({
        where: { userId, rewardId: reward.id },
      });

      hasJoined = joinedCountByUser > 0;
      reachedLimit =
        reward.maxPerUser !== null &&
        joinedCountByUser >= reward.maxPerUser;
    }

    /* ==============================
       label สถานที่
    ============================== */
    let locationLabel = "ไม่ระบุ";
    if (reward.isRedemption) {
      locationLabel = "🎁 จุดบริการ (Redemption)";
    } else if (reward.shops.length > 0) {
      locationLabel = `ร้านค้า: ${reward.shops.map((s) => s.name).join(", ")}`;
    } else if (reward.branches.length > 0) {
      locationLabel = `สาขา: ${reward.branches.map((b) => b.name).join(", ")}`;
    }

    /* ==============================
       สามารถแลกได้หรือไม่
    ============================== */
    const canRedeem =
      !isExpired &&
      !isFull &&
      !reachedLimit &&
      userPointBalance >= (reward.pointCost ?? 0);

    return NextResponse.json({
      id: reward.id,
      name: reward.name,
      description: reward.description,
      terms: reward.terms,
      imageUrl: reward.imageUrl,
      linkShare: reward.linkShare,

      pointCost: reward.pointCost || 0,
      pointEarn: reward.pointEarn || 0,

      quantity: reward.quantity || null,
      maxPerUser: reward.maxPerUser || null,

      joinedCount: reward._count.participations,
      joinedCountByUser,

      hasJoined,
      reachedLimit,

      userPointBalance,

      isExpired,
      isFull,
      canRedeem,

      startDate: reward.startDate,
      endDate: reward.endDate,
      locationLabel,
    });
  } catch (error) {
    console.error("❌ GET /api/reward/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ============================================================
   ❌ POST /api/reward/[id]
   ปิดการใช้งาน (ต้องใช้ /join เท่านั้น)
============================================================ */
export async function POST() {
  return NextResponse.json(
    {
      error: "Method Not Allowed. Please use POST /api/reward/[id]/join",
    },
    { status: 405 }
  );
}
