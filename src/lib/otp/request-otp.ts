// src/lib/otp/request-otp.ts
import { PrismaClient, OtpPurpose } from "@prisma/client"

const prisma = new PrismaClient()
const OTP_EXPIRE_MINUTES = 5

function formatPhone(phone: string) {
  // 0812345678 → 66912345678
  return phone.startsWith("0") ? "66" + phone.slice(1) : phone
}

export async function requestOtp({
  phone,
  purpose,
}: {
  phone: string
  purpose: OtpPurpose
}) {
  const res = await fetch("https://apicall.deesmsx.com/v1/otp/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey: process.env.DEESMSX_API_KEY,
      secretKey: process.env.DEESMSX_SECRET_KEY,
      to: formatPhone(phone),
      sender: process.env.DEESMSX_SENDER || "deeSMS.OTP",
      lang: "th",
      isShowRef: "1",
    }),
  })

  const data = await res.json()
  console.log("📩 deeSMSX FULL RESPONSE:", data)

  const token = data?.result?.token
  const ref = data?.result?.ref

  if (!res.ok || !token) {
    throw new Error(data?.msg || "deeSMSX ไม่ได้คืน token")
  }

  await prisma.otpVerification.create({
    data: {
      phone,
      purpose,
      provider: "DEESMSX",
      token,          // ✅ token จริง
      expiresAt: new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000),
    },
  })

  return {
    success: true,
    ref,
  }

}
