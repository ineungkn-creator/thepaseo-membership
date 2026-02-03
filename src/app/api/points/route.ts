//api/points/route.ts
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
    const balance = await prisma.pointBalance.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      userId,
      balance: balance?.balance ?? 0,
      updatedAt: balance?.updatedAt ?? null,
    });
  } catch (error) {
    console.error("❌ Error fetching user points:", error);
    return NextResponse.json({ error: "Failed to fetch user points" }, { status: 500 });
  }
}
