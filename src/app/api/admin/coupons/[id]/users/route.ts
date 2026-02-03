import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  // ✅ ต้อง await params
  const { id } = await context.params;

  console.log("FINAL couponId =", id);

  if (!id) {
    return NextResponse.json([]);
  }

  const rows = await prisma.userCoupon.findMany({
    where: {
      couponId: id, // ✅ ตรง DB แน่นอน
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: {
      assignedAt: "desc",
    },
  });

  return NextResponse.json(rows);
}
