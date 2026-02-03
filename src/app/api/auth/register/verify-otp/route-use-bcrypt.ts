// api/auth/register
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      email,
      occupation,
      residenceType,
      address,
      //houseNumber,
      //alley,
      subDistrict,
      district,
      province,
      postalCode,
      branchId,
      referralCode,
      interests = [], // คาดหวัง array ของ id เช่น ["interest_id_1", "interest_id_2"]
    } = body;

    const name = `${firstName} ${lastName}`.trim();

    // ✅ ตรวจสอบ email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 400 });
    }

    // ✅ ตรวจสอบ phone
    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      return NextResponse.json({ error: "เบอร์โทรนี้ถูกใช้งานแล้ว" }, { status: 400 });
    }

    // ✅ สร้าง referral code
    const generatedReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // ✅ ตรวจสอบ branch
    const branchRecord = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branchRecord) {
      return NextResponse.json({ error: "ไม่พบสาขาที่เลือก" }, { status: 400 });
    }

    // ✅ ตรวจสอบ interests
    if (interests.length > 0) {
      const validInterests = await prisma.interest.findMany({
        where: { id: { in: interests } },
      });
      if (validInterests.length !== interests.length) {
        return NextResponse.json({ error: "ความสนใจบางรายการไม่ถูกต้อง" }, { status: 400 });
      }
    }

    function mapGender(g: string): "MALE" | "FEMALE" | "OTHER" {
      switch (g) {
        case "ชาย":
          return "MALE";
        case "หญิง":
          return "FEMALE";
        default:
          return "OTHER";
      }
    }

    // ✅ สร้าง user พร้อมเชื่อม interests ในครั้งเดียว
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        name,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: mapGender(gender),
        phone,
        email,
        occupation,
        residenceType: residenceType || null,
        province,
        branchId: branchRecord.id,
        address,
        //houseNumber,
        //alley,
        subDistrict,
        district,
        postalCode,
        role: "USER",
        referralCode: generatedReferralCode,
        referredBy: referralCode || null,
        interests: {
          connect: interests.map((id: string) => ({ id })), // เชื่อมต่อโดยใช้ id
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}