// app/api/shop/branch/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: { shops: true },
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    return NextResponse.json(branches);
  } catch (error) {
    console.error("Error fetching branches:", error);
    return NextResponse.json(
      { error: "Failed to fetch branches" },
      { status: 500 }
    );
  }
}
