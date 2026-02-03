// lib/deesmsx.ts
export async function sendOtpWithDeeSms(phone: string) {
  const res = await fetch(
    "https://apicall.deesmsx.com/v1/otp/request",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: process.env.DEESMSX_API_KEY,
        secretKey: process.env.DEESMSX_SECRET_KEY,
        sender: process.env.DEESMSX_SENDER,
        lang: "th",
        isShowRef: "1",
        to: phone, // 062xxxxxxxx
      }),
    }
  )

  const data = await res.json()

  if (!res.ok) {
    console.error("deeSMSX error:", data)
    throw new Error(data?.message || "deeSMSX request OTP failed")
  }

  return data
}
