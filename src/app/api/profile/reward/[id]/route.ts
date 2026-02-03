//api/profile/reward/[id]
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

/**
 * ✅ GET /api/profile/reward/[id]
 * ดึงรางวัลที่ user แลกใบเดียว (RewardParticipation)
 */
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // หา rewardParticipation ตาม id
    const participation = await prisma.rewardParticipation.findUnique({
      where: { id },
      include: { reward: true },
    });

    if (!participation || participation.userId !== userId) {
      return NextResponse.json(
        { error: "ไม่พบรางวัลนี้ในบัญชีของคุณ" },
        { status: 404 }
      );
    }

    const now = new Date();

    const status = participation.redeemed
      ? "REDEEMED"
      : participation.reward.endDate &&
        participation.reward.endDate < now
      ? "EXPIRED"
      : "ACTIVE";

    return NextResponse.json({
      id: participation.id,
      status,
      redeemed: participation.redeemed,
      redeemedAt: participation.redeemedAt,
      redeemCode: participation.redeemCode,
      reward: {
        id: participation.reward.id,
        name: participation.reward.name,
        imageUrl: participation.reward.imageUrl,
        description: participation.reward.description,
        terms: participation.reward.terms,
        endDate: participation.reward.endDate,
        pointCost: participation.reward.pointCost,
      },
    });
  } catch (error) {
    console.error("❌ GET /api/profile/reward/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reward" },
      { status: 500 }
    );
  }
}
