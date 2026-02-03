// app/api/profile/route.ts
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // ✅ ดึงข้อมูล user + point + interests
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        pointBalance: true,
        interests: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const activeCouponCount = await prisma.userCoupon.count({
      where: {
        userId,
        used: false,
        coupon: {
          expiresAt: { gte: new Date() },
        },
      },
    });
    
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        occupation: user.occupation,
        residenceType: user.residenceType,
        address: user.address,
        //houseNumber: user.houseNumber,
        //alley: user.alley,
        subDistrict: user.subDistrict,
        district: user.district,
        province: user.province,
        postalCode: user.postalCode,
        branchId: user.branchId,
        point: user.pointBalance?.balance ?? 0,

        // ✅ จำนวนคูปองที่ยังไม่ได้ใช้
        activeCouponCount,

        interests: user.interests.map((interest) => ({
          id: interest.id,
          name: interest.name,
        })),
      },
    })
  } catch (error) {
    console.error("❌ Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}


export async function PATCH(req: Request) {
  const serverSession = await getServerSession(authConfig);
  if (!serverSession?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  try {
    // ตรวจสอบ email/phone ซ้ำ
    if (body.email) {
      const emailExists = await prisma.user.findFirst({
        where: { email: body.email, NOT: { id: serverSession.user.id } },
      });
      if (emailExists) return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    if (body.phone) {
      const phoneExists = await prisma.user.findFirst({
        where: { phone: body.phone, NOT: { id: serverSession.user.id } },
      });
      if (phoneExists) return NextResponse.json({ error: "Phone already exists" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: serverSession.user.id },
      data: {
        avatar: body.avatar,
        name: body.name,
        phone: body.phone,
        email: body.email,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        gender: body.gender,
        occupation: body.occupation,
        residenceType: body.residenceType,
        address: body.address,
        //houseNumber: body.houseNumber,
        //alley: body.alley,
        subDistrict: body.subDistrict,
        district: body.district,
        province: body.province,
        postalCode: body.postalCode,
        branchId: body.branchId,
        interests: Array.isArray(body.interests)
          ? { set: body.interests.map((id: string) => ({ id })) }
          : undefined,
      },
      include: { interests: true, branch: true },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: Request) {
  const serverSession = await getServerSession(authConfig);
  if (!serverSession?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  try {
    // ตรวจสอบ email/phone ซ้ำ
    if (data.email) {
      const emailExists = await prisma.user.findFirst({
        where: { email: data.email, NOT: { id: serverSession.user.id } },
      });
      if (emailExists) return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    if (data.phone) {
      const phoneExists = await prisma.user.findFirst({
        where: { phone: data.phone, NOT: { id: serverSession.user.id } },
      });
      if (phoneExists) return NextResponse.json({ error: "Phone already exists" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: serverSession.user.id },
      data: {
        avatar: data.avatar,
        name: data.name,
        phone: data.phone,
        email: data.email,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender,
        occupation: data.occupation,
        address: data.address,
        //houseNumber: data.houseNumber,
        //alley: data.alley,
        subDistrict: data.subDistrict,
        district: data.district,
        province: data.province,
        postalCode: data.postalCode,
        branchId: data.branchId,
        residenceType: data.residenceType,
        interests: Array.isArray(data.interests)
          ? { set: data.interests.map((id: string) => ({ id })) }
          : undefined,
      },
      include: { interests: true, branch: true },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}