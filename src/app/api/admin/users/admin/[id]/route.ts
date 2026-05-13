import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// role ที่อนุญาตให้เข้าถึง
const allowedRoles = ["ADMIN", "CRMMANAGEMENT"];

/**
 * GET - ดึงข้อมูล admin รายคน
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authConfig);

  if (!session || !allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  const admin = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!admin) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  return NextResponse.json(admin);
}

/**
 * PATCH - แก้ไข admin
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authConfig);

  if (!session || !allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const { name, email, role, password } = body;

  const updateData: any = {
    name,
    email,
    role,
  };

  // ถ้ามี password ใหม่ → hash
  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const admin = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ success: true, admin });
}

/**
 * DELETE - ลบ admin
 * ต้องยืนยัน password ของ admin ที่ login อยู่
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authConfig);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const { password } = await req.json();

  if (!password) {
    return NextResponse.json(
      { error: "กรุณากรอกรหัสผ่านเพื่อยืนยัน" },
      { status: 400 }
    );
  }

  // ตรวจ password ของ admin ที่ login
  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!admin || !(await bcrypt.compare(password, admin.password ?? ""))) {
    return NextResponse.json(
      { error: "รหัสผ่านแอดมินไม่ถูกต้อง" },
      { status: 401 }
    );
  }

  await prisma.user.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}