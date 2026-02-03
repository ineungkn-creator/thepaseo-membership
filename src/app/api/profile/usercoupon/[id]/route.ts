//api/profile/usercoupon/[id]
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const userCoupon = await prisma.userCoupon.findUnique({
      where: { id },
      include: { coupon: true },
    });

    if (!userCoupon || userCoupon.userId !== userId) {
      return NextResponse.json({ error: "ไม่พบคูปองนี้ในบัญชีของคุณ" }, { status: 404 });
    }

    const expired = userCoupon.coupon.expiresAt < new Date();

    return NextResponse.json({
      id: userCoupon.id,
      status: userCoupon.used
        ? "USED"
        : expired
        ? "EXPIRED"
        : "ACTIVE",
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
    console.error("❌ GET /api/usercoupon/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
