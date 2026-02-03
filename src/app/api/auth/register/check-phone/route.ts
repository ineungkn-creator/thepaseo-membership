import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const { phone } = await req.json()

  if (!phone) {
    return NextResponse.json(
      { error: "กรุณากรอกเบอร์โทรศัพท์" },
      { status: 400 }
    )
  }

  const existingUser = await prisma.user.findUnique({
    where: { phone },
  })

  if (existingUser) {
    return NextResponse.json(
      { error: "เบอร์นี้ลงทะเบียนแล้ว" },
      { status: 400 }
    )
  }

  return NextResponse.json({ ok: true })
}
