// app/api/cron/cleanup-otp/route.ts
import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  const result = await prisma.otpVerification.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  })

  return NextResponse.json({
    deleted: result.count,
  })
}
