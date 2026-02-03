import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ✅ Utility: ตรวจสิทธิ์
function canAccess(role: string) {
  return ["ADMIN", "CRMMANAGEMENT", "ADMINMARKETING"].includes(role);
}

// 🔍 GET: ดึงข้อมูลผู้ใช้รายเดียว (พร้อม interests + branch)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authConfig);
  if (!session || !canAccess(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        interests: true,
        branch: true,
        pointBalance: true,
        pointTxns: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("❌ GET /admin/users/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✏️ PATCH: แก้ไขข้อมูลผู้ใช้
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authConfig);
  if (!session || !canAccess(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const {
      name,
      email,
      phone,
      password,
      role,
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
    } = body;

    const updateData: any = {
      name,
      email,
      phone,
      role,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
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
    };

    // ถ้ามี password ใหม่ → hash ก่อน
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // ✅ interests
    if (Array.isArray(interests)) {
      updateData.interests = {
        set: [],
        connect: interests.map((id: string) => ({ id })),
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        interests: true,
        branch: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("❌ PATCH /admin/users/[id] error:", error);
    return NextResponse.json({ error: "Cannot update user" }, { status: 500 });
  }
}

// ❌ DELETE: ลบผู้ใช้ (ยืนยันรหัสผ่านแอดมินก่อน)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: "กรุณากรอกรหัสผ่านแอดมินเพื่อยืนยัน" }, { status: 400 });
    }

    // ตรวจรหัสผ่านแอดมินก่อน
    const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!admin || !(await bcrypt.compare(password, admin.password ?? ""))) {
      return NextResponse.json({ error: "รหัสผ่านแอดมินไม่ถูกต้อง" }, { status: 401 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ DELETE /admin/users/[id] error:", error);
    return NextResponse.json({ error: "ไม่สามารถลบผู้ใช้ได้" }, { status: 500 });
  }
}
