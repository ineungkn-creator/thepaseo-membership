// src/lib/otp/otp-log.ts
import { PrismaClient, OtpPurpose, OtpLogStatus } from "@prisma/client"

const prisma = new PrismaClient()

export async function logOtpRequest({
  phone,
  purpose,
  status,
  reason,
  ipAddress,
  userAgent,
}: {
  phone: string
  purpose: OtpPurpose
  status: OtpLogStatus
  reason?: string
  ipAddress?: string
  userAgent?: string
}) {
  await prisma.otpRequestLog.create({
    data: {
      phone,
      purpose,
      status,
      reason,
      ipAddress,
      userAgent,
    },
  })
}
