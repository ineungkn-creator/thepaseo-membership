//api/profile/reward
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

/**
 * ✅ GET /api/profile/reward
 * ดึงเฉพาะ Reward ที่ user เคยแลก (จาก RewardParticipation)
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = 20;
    const skip = (page - 1) * pageSize;
    const now = new Date();

    const participations = await prisma.rewardParticipation.findMany({
      where: { userId },
      include: { reward: true },
      orderBy: { joinedAt: "desc" },
    });

    const mapped = participations.map((rp) => {
      let status: "ACTIVE" | "EXPIRED" | "REDEEMED" = "ACTIVE";

      if (rp.redeemed) status = "REDEEMED";
      else if (rp.reward.endDate && rp.reward.endDate < now)
        status = "EXPIRED";

      return {
        id: rp.id,
        status,
        redeemed: rp.redeemed,
        redeemedAt: rp.redeemedAt,
        redeemCode: rp.redeemCode,
        joinedAt: rp.joinedAt,
        reward: {
          id: rp.reward.id,
          name: rp.reward.name,
          imageUrl: rp.reward.imageUrl,
          endDate: rp.reward.endDate,
          pointCost: rp.reward.pointCost,
        },
      };
    });

    // 🔹 Sorting (เหมือน coupon)
    const sorted = [
      ...mapped.filter(r => r.status === "ACTIVE"),
      ...mapped.filter(r => r.status === "EXPIRED"),
      ...mapped.filter(r => r.status === "REDEEMED"),
    ];

    const total = sorted.length;
    const totalPages = Math.ceil(total / pageSize);
    const items = sorted.slice(skip, skip + pageSize);

    return NextResponse.json({
      items,
      page,
      pageSize,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("❌ Error fetching rewards:", error);
    return NextResponse.json(
      { error: "Failed to fetch rewards" },
      { status: 500 }
    );
  }
}