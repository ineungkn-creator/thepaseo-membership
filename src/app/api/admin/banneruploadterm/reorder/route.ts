import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { bannerOrder } = await req.json(); // รับ array ของ { id, order }
    
    // อัปเดตลำดับของแบนเนอร์ทั้งหมดใน transaction เดียว
    await prisma.$transaction(
      bannerOrder.map(({ id, order }: { id: string; order: number }) =>
        prisma.bannerUploadTerm.update({
          where: { id },
          data: { order },
        })
      )
    );

    return NextResponse.json({ message: "Reordered successfully" });
  } catch (error) {
    console.error("Error reordering bannerUploadTerm:", error);
    return NextResponse.json({ error: "Failed to reorder bannerupload" }, { status: 500 });
  }
}