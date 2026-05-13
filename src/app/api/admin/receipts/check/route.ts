import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { receiptNumber, shopId } = await req.json();

    if (!receiptNumber || !shopId) {
      return NextResponse.json(
        { error: "receiptNumber and shopId required" },
        { status: 400 }
      );
    }

    const duplicate = await prisma.receipt.findFirst({
      where: {
        receiptNumber,
        shopId,
        status: {
          in: ["PENDING", "APPROVED"],
        },
      },
      select: {
        id: true,
        receiptNumber: true,
        receiptDate: true,
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    if (duplicate) {
      return NextResponse.json({
        duplicate: true,
        data: duplicate,
      });
    }

    return NextResponse.json({
      duplicate: false,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}