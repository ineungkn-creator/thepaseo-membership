import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * ✅ GET — ดึงรายชื่อผู้ใช้ (ทั้งหมด / search)
 */
export async function GET(req: Request) {
  const session = await getServerSession(authConfig);
      if (!session) {
        return NextResponse.json({ error: "No session found. Please login." }, { status: 403 });
      }
      
      const allowedRoles = ["ADMIN", "ADMINMARKETING", "CRMMANAGEMENT", "STAFF"];
      if (!allowedRoles.includes(session.user.role)) {
        return NextResponse.json(
          { error: `Unauthorized: User role '${session.user.role}' is not allowed` },
          { status: 403 }
        );
      }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { phone: { contains: search } },
          { email: { contains: search } },
        ],
      }
    : {};

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
    },
  });

  return NextResponse.json({ users });
}

/**
 * ✅ POST — เพิ่มผู้ใช้ (USER / ADMIN)
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || !["ADMIN", "CRMMANAGEMENT"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();

    const {
      name,
      email,
      password,
      role,
      phone,
      dateOfBirth,
      gender,
      occupation,
      residenceType,
      address,
      //houseNumber,
      //alley,
      subDistrict,
      district,
      province,
      postalCode,
      branchId,
      referralCode,
      interests,
    } = body;

    // ตรวจว่ากำลังสร้าง USER หรือ ADMIN
    if (role && role !== "USER") {
      // 🧑‍💼 ADMIN MODE
      if (!email || !password || !name) {
        return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
      }

      const existingAdmin = await prisma.user.findUnique({ where: { email } });
      if (existingAdmin) {
        return NextResponse.json({ error: "Email นี้ถูกใช้งานแล้ว" }, { status: 400 });
      }

      const hashed = await bcrypt.hash(password, 10);
      const newAdmin = await prisma.user.create({
        data: {
          name,
          email,
          password: hashed,
          role,
          referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        },
      });

      return NextResponse.json({ success: true, user: newAdmin });
    }

    // 👤 USER MODE
    if (!phone || !branchId) {
      return NextResponse.json({ error: "กรุณากรอกเบอร์โทรและสาขา" }, { status: 400 });
    }

    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      return NextResponse.json({ error: "เบอร์โทรนี้ถูกใช้งานแล้ว" }, { status: 400 });
    }

    const generatedReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newUser = await prisma.user.create({
      data: {
        name: name || "สมาชิกใหม่",
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        occupation,
        residenceType,
        address,
        //houseNumber,
        //alley,
        subDistrict,
        district,
        province,
        postalCode,
        branchId,
        referralCode: generatedReferralCode,
        referredBy: referralCode || null,
        role: "USER",
        interests: interests?.length
          ? {
              connect: interests.map((id: string) => ({ id })),
            }
          : undefined,
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error("❌ Create user error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างผู้ใช้" }, { status: 500 });
  }
}

/**
 * ✏️ PATCH — แก้ไขข้อมูลผู้ใช้
 */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || !["ADMIN", "CRMMANAGEMENT"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

    const body = await req.json();

    const {
      name,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      occupation,
      residenceType,
      address,
      //houseNumber,
      //alley,
      subDistrict,
      district,
      province,
      postalCode,
      branchId,
      interests,
      role,
    } = body;

    const updateData: any = {
      name,
      email,
      phone,
      gender,
      occupation,
      residenceType,
      address,
      //houseNumber,
      //alley,
      subDistrict,
      district,
      province,
      postalCode,
      branchId,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (role) {
      updateData.role = role;
    }

    if (interests?.length) {
      updateData.interests = {
        set: [],
        connect: interests.map((id: string) => ({ id })),
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("❌ Update user error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการแก้ไขผู้ใช้" }, { status: 500 });
  }
}

/**
 * ❌ DELETE — ลบผู้ใช้ ต้องยืนยันรหัสผ่านแอดมิน
 */
export async function DELETE(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();
    const { password } = body;

    if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    if (!password) return NextResponse.json({ error: "กรุณากรอกรหัสผ่านยืนยัน" }, { status: 400 });

    const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!admin || !(await bcrypt.compare(password, admin.password ?? ""))) {
      return NextResponse.json({ error: "รหัสผ่านแอดมินไม่ถูกต้อง" }, { status: 401 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Delete user error:", error);
    return NextResponse.json({ error: "ไม่สามารถลบผู้ใช้ได้" }, { status: 500 });
  }
}
