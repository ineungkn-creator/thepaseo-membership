// /api/auth/verify-otp
import { NextResponse } from "next/server"
import { verifyOtp } from "@/lib/otp/verify-otp"
import { OtpPurpose } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const { phone, otp, purpose } = await req.json()

    await verifyOtp({
      phone,
      otp,
      purpose: OtpPurpose.VERIFY_PHONE,
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 401 }
    )
  }
}
