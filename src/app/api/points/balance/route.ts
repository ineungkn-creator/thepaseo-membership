//api/points/balance/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // หา point balance ของ user
    const pointBalance = await prisma.pointBalance.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      balance: pointBalance?.balance ?? 0,
    });
  } catch (error) {
    console.error("Error fetching point balance:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
