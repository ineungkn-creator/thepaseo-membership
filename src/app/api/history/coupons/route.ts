import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.max(1, Number(searchParams.get("limit") || 20));
    const skip = (page - 1) * limit;

    const total = await prisma.userCoupon.count({
      where: { userId },
    });

    const totalPages = Math.ceil(total / limit);

    const coupons = await prisma.userCoupon.findMany({
      where: { userId },
      orderBy: { assignedAt: "desc" },
      skip,
      take: limit,
      include: {
        coupon: {
          select: {
            id: true,
            code: true,
            name: true,
            expiresAt: true,
            shops: { select: { name: true } },
            branches: { select: { name: true } },
          },
        },
      },
    });

    const data = coupons.map((uc) => ({
      id: uc.id,
      used: uc.used,
      assignedAt: uc.assignedAt,
      coupon: {
        id: uc.coupon.id,
        code: uc.coupon.code,
        name: uc.coupon.name,
        expiresAt: uc.coupon.expiresAt,
        shops: uc.coupon.shops,
        branches: uc.coupon.branches,
      },
    }));

    return NextResponse.json({
      meta: { page, limit, total, totalPages },
      data,
    });
  } catch (error) {
    console.error("❌ /api/history/coupons", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
