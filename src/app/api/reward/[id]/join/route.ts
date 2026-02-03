//api/reward/[id]/join
import { NextResponse } from "next/server";
import { PrismaClient, PointType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { redeemPointsFIFO } from "@/lib/point/fifoRedeem";

const prisma = new PrismaClient();

/**
 * ✅ GET /api/reward/[id]
 * ดึงข้อมูล reward พร้อมตรวจสอบสถานะของผู้ใช้
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");

    const reward = await prisma.reward.findUnique({
      where: { id },
      include: {
        shops: true,
        branches: true,
        participations: true,
        _count: { select: { participations: true } },
      },
    });

    if (!reward) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    // ✅ ตรวจสอบจำนวนครั้งที่ user เข้าร่วม
    let isJoined = false;
    let joinedCountByUser = 0;

    if (userId) {
      const userParticipations = await prisma.rewardParticipation.count({
        where: { rewardId: reward.id, userId },
      });
      joinedCountByUser = userParticipations;

      if (reward.maxPerUser && userParticipations >= reward.maxPerUser) {
        isJoined = true;
      }
    }

    // ✅ Location label สำหรับแสดงผล
    let locationLabel = "ไม่ระบุ";
    if (reward.isRedemption) {
      locationLabel = "🎁 จุดบริการ (Redemption)";
    } else if (reward.shops.length > 0) {
      locationLabel = `ร้านค้า: ${reward.shops.map((s) => s.name).join(", ")}`;
    } else if (reward.branches.length > 0) {
      locationLabel = `สาขา: ${reward.branches.map((b) => b.name).join(", ")}`;
    }

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
      startDate: reward.startDate,
      endDate: reward.endDate,
      joinedCount: reward._count.participations,
      joinedCountByUser,
      isJoined,
      locationLabel,
      isRedemption: reward.isRedemption,
    });
  } catch (error) {
    console.error("❌ Error fetching reward:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * ✅ POST /api/reward/[id]
 * ใช้สำหรับแลกรางวัล (หักแต้ม / เพิ่มแต้ม / บันทึก participation)
 */
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authConfig);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;

    const reward = await prisma.reward.findUnique({
      where: { id },
      include: { shops: true, branches: true, _count: { select: { participations: true } } },
    });
    if (!reward) return NextResponse.json({ error: "Reward not found" }, { status: 404 });

    const now = new Date();
    const start = new Date(reward.startDate).getTime();
    const current = new Date().getTime();

    if (start > current) {
      return NextResponse.json({ error: "ยังไม่เปิดให้แลก" }, { status: 400 });
    }
    if (reward.endDate < now) return NextResponse.json({ error: "หมดอายุแล้ว" }, { status: 400 });
    if (reward.quantity && reward._count.participations >= reward.quantity)
      return NextResponse.json({ error: "รางวัลหมดแล้ว" }, { status: 400 });

    const existing = await prisma.rewardParticipation.count({
      where: { userId, rewardId: reward.id },
    });
    if (reward.maxPerUser && existing >= reward.maxPerUser)
      return NextResponse.json({ error: "คุณแลกรางวัลครบจำนวนที่กำหนดแล้ว" }, { status: 400 });

    // แต้ม
    let balance = await prisma.pointBalance.findUnique({ where: { userId } });
    if (!balance)
      balance = await prisma.pointBalance.create({ data: { userId, balance: 0 } });

    const wallets = await prisma.pointWallet.aggregate({
      where: {
        userId,
        AND: [
          { points: { gt: 0 } },
          { usedPoints: { lt: prisma.pointWallet.fields.points } },
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
        ],
      },
      _sum: {
        points: true,
      },
    });

    const availablePoints = wallets._sum.points ?? 0;
    const requiredPoints = reward.pointCost ?? 0;

    if (availablePoints < requiredPoints) {
      return NextResponse.json(
        { error: "แต้มไม่เพียงพอ" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      let updatedBalance = balance!.balance;

      if (reward.pointCost && reward.pointCost > 0) {
        await redeemPointsFIFO({
          tx,
          userId,
          amount: reward.pointCost,
        });

        updatedBalance -= reward.pointCost;

        await tx.pointTransaction.create({
          data: {
            userId,
            type: PointType.REDEEM,
            referenceType: "REWARD",
            referenceId: reward.id,
            amount: -reward.pointCost,
            balanceAfter: updatedBalance,
            description: `ใช้แต้มแลกของรางวัล: ${reward.name}`,
          },
        });
      }

      if (reward.pointEarn && reward.pointEarn > 0) {
        updatedBalance += reward.pointEarn;
        await tx.pointTransaction.create({
          data: {
            userId,
            type: PointType.EARN,
            referenceType: "REWARD",
            referenceId: reward.id,
            amount: reward.pointEarn,
            balanceAfter: updatedBalance,
            description: `ได้รับแต้มจากของรางวัล: ${reward.name}`,
          },
        });
      }

      await tx.pointBalance.update({
        where: { userId },
        data: { balance: updatedBalance },
      });

      function generateRedeemCode() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let code = "";
        for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
        return code;
      }

      const participation = await tx.rewardParticipation.create({
        data: {
          userId,
          rewardId: reward.id,
          redeemCode: generateRedeemCode(), // ✅ new
        },
      });

      if (reward.quantity && reward.quantity > 0) {
        await tx.reward.update({
          where: { id: reward.id },
          data: { quantity: { decrement: 1 } },
        });
      }

      return { participation, updatedBalance };
    });

    return NextResponse.json({
      message: "🎉 แลกรางวัลสำเร็จ!",
      participation: result.participation,
      balanceAfter: result.updatedBalance,
    });
  } catch (error) {
    console.error("❌ POST /api/reward/[id]/join error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
