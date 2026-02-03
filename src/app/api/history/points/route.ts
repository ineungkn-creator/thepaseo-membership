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

    const total = await prisma.pointTransaction.count({
      where: { userId },
    });

    const totalPages = Math.ceil(total / limit);

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

    const data = points.map((p) => ({
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

    return NextResponse.json({
      meta: { page, limit, total, totalPages },
      data,
    });
  } catch (error) {
    console.error("❌ /api/history/points", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
