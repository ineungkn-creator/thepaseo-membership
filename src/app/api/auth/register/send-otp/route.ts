//api/auth/register/send-otp
import { NextResponse } from "next/server"
import { requestOtp } from "@/lib/otp/request-otp"
import { OtpPurpose } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const { phone } = await req.json()

    if (!phone) {
      return NextResponse.json(
        { error: "กรุณาระบุเบอร์โทรศัพท์" },
        { status: 400 }
      )
    }

    await requestOtp({
      phone,
      purpose: OtpPurpose.REGISTER,
    })

    return NextResponse.json({ message: "ส่ง OTP สำเร็จ" })
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 429 }
    )
  }
}
