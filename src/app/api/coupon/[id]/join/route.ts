//api/coupon/[id]/join
import { NextResponse } from "next/server";
import { PrismaClient, PointType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { redeemPointsFIFO } from "@/lib/point/fifoRedeem";

const prisma = new PrismaClient();

/* ============================================================
   ✅ GET /api/coupon/[id]/join
   ใช้ในหน้า /profile/coupon/[id] เพื่อดูคูปองที่แลกไว้
============================================================ */
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

let userCoupon = await prisma.userCoupon.findUnique({
  where: { id },
  include: { coupon: true },
});

if (!userCoupon) {
  // fallback: id อาจเป็น couponId
  const existing = await prisma.userCoupon.findFirst({
    where: { userId, couponId: id },
    include: { coupon: true },
  });
  userCoupon = existing || null;
}

    if (!userCoupon || userCoupon.userId !== userId) {
      return NextResponse.json({ error: "ไม่พบคูปองนี้ในบัญชีของคุณ" }, { status: 404 });
    }

    return NextResponse.json({
      id: userCoupon.id,
      used: userCoupon.used,
      usedAt: userCoupon.usedAt,
      redeemCode: userCoupon.redeemCode,
      coupon: {
        id: userCoupon.coupon.id,
        name: userCoupon.coupon.name,
        description: userCoupon.coupon.description,
        imageUrl: userCoupon.coupon.imageUrl,
        expiresAt: userCoupon.coupon.expiresAt,
      },
    });
  } catch (error) {
    console.error("❌ GET /api/coupon/[id]/join error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/* ============================================================
   ✅ POST /api/coupon/[id]/join
   สำหรับแลกคูปอง (หักแต้ม + เพิ่ม record UserCoupon)
============================================================ */
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authConfig);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const userId = session.user.id;
    const couponId = id;

    // ✅ หา coupon พร้อม campaign / shop / branch
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      include: {
        campaign: true,
        shops: true,
        branches: true,
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: "ไม่พบคูปองนี้" }, { status: 404 });
    }

    const now = Date.now();

    if (!coupon.startDate) {
      return NextResponse.json({ error: "คูปองยังไม่ได้กำหนดวันเริ่ม" }, { status: 400 });
    }

    if (!coupon.endDate) {
      return NextResponse.json({ error: "คูปองยังไม่ได้กำหนดวันสิ้นสุด" }, { status: 400 });
    }

    const startTime = new Date(coupon.startDate).getTime();
    const endTime = new Date(coupon.endDate).getTime();

    if (startTime > now) {
      return NextResponse.json({ error: "คูปองนี้ยังไม่เริ่มแจก" }, { status: 400 });
    }

    if (endTime < now) {
      return NextResponse.json({ error: "คูปองนี้หมดระยะเวลาการแจกแล้ว" }, { status: 400 });
    }


    // ✅ ตรวจสอบจำนวนคงเหลือ
    if (coupon.quantity !== null && coupon.quantity <= 0)
      return NextResponse.json({ error: "คูปองนี้แจกครบจำนวนแล้ว" }, { status: 400 });

    // ✅ ตรวจสอบว่าผู้ใช้รับคูปองนี้ไปแล้วหรือยัง
    const existing = await prisma.userCoupon.findMany({ where: { userId, couponId } });
    if (coupon.maxPerUser && existing.length >= coupon.maxPerUser) {
      return NextResponse.json({ error: "คุณรับคูปองนี้ครบจำนวนที่กำหนดแล้ว" }, { status: 400 });
    }

    // ✅ ตรวจสอบ point balance ของ user
    let balanceRecord = await prisma.pointBalance.findUnique({ where: { userId } });
    if (!balanceRecord) {
      balanceRecord = await prisma.pointBalance.create({ data: { userId, balance: 0 } });
    }

    if (coupon.pointCost && balanceRecord.balance < coupon.pointCost) {
      return NextResponse.json({ error: "แต้มของคุณไม่เพียงพอ" }, { status: 400 });
    }

    // ✅ กำหนด context
    const contextTx = {
      campaignId: coupon.campaignId || null,
      couponId: coupon.id,
      shopId: coupon.shops[0]?.id || null,
      branchId: coupon.branches[0]?.id || null,
    };

    // ✅ ฟังก์ชันสร้าง redeemCode
    function generateRedeemCode() {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
      return code;
    }

    // ✅ Transaction
    const result = await prisma.$transaction(async (tx) => {
      let updatedBalance = balanceRecord!.balance;

      // --- หักแต้ม (REDEEM)
    if (coupon.pointCost && coupon.pointCost > 0) {
      await redeemPointsFIFO({
        tx,
        userId,
        amount: coupon.pointCost,
      });

      updatedBalance -= coupon.pointCost;

      await tx.pointTransaction.create({
        data: {
          userId,
          type: PointType.REDEEM,
          referenceType: "COUPON",
          ...contextTx,
          amount: -coupon.pointCost,
          balanceAfter: updatedBalance,
          referenceId: coupon.id,
          description: `ใช้แต้มเพื่อรับคูปอง: ${coupon.name}`,
        },
      });
    }

      // --- เพิ่มแต้ม (EARN)
      if (coupon.pointEarn && coupon.pointEarn > 0) {
        updatedBalance += coupon.pointEarn;
        await tx.pointTransaction.create({
          data: {
            userId,
            type: PointType.EARN,
            referenceType: "COUPON",
            ...contextTx,
            amount: coupon.pointEarn,
            balanceAfter: updatedBalance,
            referenceId: coupon.id,
            description: `ได้รับแต้มจากคูปอง: ${coupon.name}`,
          },
        });
      }

      // --- อัปเดต balance
      await tx.pointBalance.update({
        where: { userId },
        data: { balance: updatedBalance },
      });

      // --- สร้าง UserCoupon พร้อม redeemCode
      const newCoupon = await tx.userCoupon.create({
        data: { 
          userId, 
          couponId,
          redeemCode: generateRedeemCode(), // ✅ สร้างรหัสเฉพาะ
        },
      });

      // --- ลดจำนวนคูปองคงเหลือ
      if (coupon.quantity && coupon.quantity > 0) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { quantity: { decrement: 1 } },
        });
      }

      return { newCoupon, updatedBalance };
    });

    return NextResponse.json({
      message: "🎉 รับคูปองสำเร็จ!",
      userCoupon: result.newCoupon,
      balanceAfter: result.updatedBalance,
    });
  } catch (error) {
    console.error("❌ Error joining coupon:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
