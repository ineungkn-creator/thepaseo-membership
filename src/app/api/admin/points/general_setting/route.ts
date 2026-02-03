// src/app/api/admin/points/general_setting/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { v4 as uuidv4 } from "uuid"; 

const prisma = new PrismaClient();

export async function GET() {
  const setting = await prisma.pointSetting.findFirst();
  return NextResponse.json(setting);
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { signupPoints, referralPoints, receiptRateAmount, receiptRatePoints, pointExpireYears } =
      await req.json();

    const existingSetting = await prisma.pointSetting.findFirst({
      where: { isDefault: true },
    });

    const updated = await prisma.pointSetting.upsert({
      where: { id: existingSetting?.id ?? "default-id" },
      update: {
        signupPoints,
        referralPoints,
        receiptRateAmount,
        receiptRatePoints,
        pointExpireYears,
        isDefault: true,
      },
      create: {
        id: existingSetting?.id ?? uuidv4(), // ✅ แก้เรียกใช้ uuid แบบถูกต้อง
        signupPoints,
        referralPoints,
        receiptRateAmount,
        receiptRatePoints,
        pointExpireYears,
        isDefault: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating point settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
