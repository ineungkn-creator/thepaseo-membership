// app/api/profile/complete/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      dateOfBirth,
      gender,
      phone,
      email,
      occupation,
      residenceType,
      province,
      branchId,
      address,
      subDistrict,
      district,
      postalCode,
      referralCode,
    } = body

    const generatedReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // ✅ ตรวจสอบ branch
        const branchRecord = await prisma.branch.findUnique({ where: { id: branchId } });
        if (!branchRecord) {
          return NextResponse.json({ error: "ไม่พบสาขาที่เลือก" }, { status: 400 });
        }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        dateOfBirth: new Date(dateOfBirth),
        gender,
        phone,
        email,
        occupation,
        residenceType,
        province,
        branchId: branchRecord.id,
        address,
        subDistrict,
        district,
        postalCode,
        referralCode: generatedReferralCode,
        referredBy: referralCode || null,
      },
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error("Complete profile error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
