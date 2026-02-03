import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    /* ===============================
       AUTH
    =============================== */
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    /* ===============================
       QUERY PARAMS
    =============================== */
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.max(1, Number(searchParams.get("limit") || 2));
    const skip = (page - 1) * limit;

    /* ===============================
       BALANCE
    =============================== */
    let balanceRecord = await prisma.pointBalance.findUnique({
      where: { userId },
    });

    if (!balanceRecord) {
      balanceRecord = await prisma.pointBalance.create({
        data: { userId, balance: 0 },
      });
    }

    /* ===============================
       POINTS (PAGINATED)
    =============================== */
    const totalPoints = await prisma.pointTransaction.count({
      where: { userId },
    });

    const totalPages = Math.ceil(totalPoints / limit);

    const points = await prisma.pointTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        receipt: {
          select: {
            status: true,
            rejectReason: true,
            shop: { select: { name: true } },
            branch: { select: { name: true } },
          },
        },
      },
    });

    const formattedPoints = points.map((p) => ({
      id: p.id,
      type: p.type,
      amount: p.amount,
      balanceAfter: p.balanceAfter,
      description: p.description,
      createdAt: p.createdAt,
      receipt: p.receipt
        ? {
            status: p.receipt.status,
            rejectReason: p.receipt.rejectReason,
            shopName: p.receipt.shop?.name || "-",
            branchName: p.receipt.branch?.name || "-",
          }
        : null,
    }));

    /* ===============================
       COUPONS (NOT PAGINATED)
    =============================== */
    const coupons = await prisma.userCoupon.findMany({
      where: { userId },
      orderBy: { assignedAt: "desc" },
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

    /* ===============================
       RESPONSE (CLEAR STRUCTURE)
    =============================== */
    return NextResponse.json({
      meta: {
        page,
        limit,
        totalPoints,
        totalPages,
      },
      balance: balanceRecord.balance,
      points: formattedPoints,
      coupons,
    });
  } catch (error) {
    console.error("❌ /api/history error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
