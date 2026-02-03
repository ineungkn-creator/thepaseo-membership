import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { id, direction } = await req.json();

    const current = await prisma.shopCategory.findUnique({
      where: { id },
    });

    if (!current) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const target = await prisma.shopCategory.findFirst({
      where: {
        sortOrder:
          direction === "up"
            ? { lt: current.sortOrder }
            : { gt: current.sortOrder },
      },
      orderBy: {
        sortOrder: direction === "up" ? "desc" : "asc",
      },
    });

    // ถ้าไม่มีตัวบน / ล่าง → ไม่ต้องทำอะไร
    if (!target) {
      return NextResponse.json({ success: true });
    }

    // swap sortOrder
    await prisma.$transaction([
      prisma.shopCategory.update({
        where: { id: current.id },
        data: { sortOrder: target.sortOrder },
      }),
      prisma.shopCategory.update({
        where: { id: target.id },
        data: { sortOrder: current.sortOrder },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
