// lib/otp.cleanup.ts
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function cleanupExpiredOtps() {
  await prisma.otpVerification.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  })
}
