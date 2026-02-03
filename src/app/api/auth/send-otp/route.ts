//api/auth/send-otp
import { NextResponse } from "next/server"
import { requestOtp } from "@/lib/otp/request-otp"
import { OtpPurpose } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("📥 send-otp body:", body)

    const { phone, purpose } = body

    await requestOtp({
      phone,
      purpose: OtpPurpose.VERIFY_PHONE,
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("❌ send-otp ERROR FULL:", e)
    return NextResponse.json(
      {
        error: e.message,
        stack: e.stack,
      },
      { status: 500 }
    )
  }
}
