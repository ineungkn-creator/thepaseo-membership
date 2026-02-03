//api/auth/register/verify-otp
import { NextResponse } from "next/server"
import { PrismaClient, OtpPurpose } from "@prisma/client"
import { verifyOtp } from "@/lib/otp/verify-otp"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json()

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "กรุณากรอกเบอร์โทรศัพท์และรหัส OTP" },
        { status: 400 }
      )
    }

    // ✅ ตรวจ OTP ผ่าน service กลาง
    await verifyOtp({
      phone,
      otp,
      purpose: OtpPurpose.REGISTER,
    })

    // ✅ กันสมัครซ้ำ
    const existingUser = await prisma.user.findUnique({ where: { phone } })
    if (existingUser) {
      return NextResponse.json(
        { error: "เบอร์นี้ลงทะเบียนแล้ว" },
        { status: 400 }
      )
    }

    // ✅ สร้าง user
    const user = await prisma.user.create({
      data: {
        phone,
        name: "สมาชิกใหม่",
        referralCode: Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase(),
        isPhoneVerified: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "สมัครสมาชิกสำเร็จ",
      user: {
        id: user.id,
        phone: user.phone,
      },
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 400 }
    )
  }
}
