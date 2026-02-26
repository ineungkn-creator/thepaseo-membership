// app/api/admin/points/calculate/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { amount, shopId } = await req.json();

    if (!amount || !shopId) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    // ⭐ ดึง setting
    const setting = await prisma.pointSetting.findFirst();
    if (!setting) {
      return NextResponse.json(
        { error: "Point setting not found" },
        { status: 500 }
      );
    }

    // ⭐ ดึง shop
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    const rateAmount =
    shop?.customRate ?? setting.receiptRateAmount;

    const ratePoints = setting.receiptRatePoints || 1;

    const points =
    Math.floor(Number(amount) / rateAmount) * ratePoints;

    return NextResponse.json({ points });

  } catch (error) {
    console.error("calculate error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}