import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const branch = await prisma.branch.findUnique({ where: { id } });
  return NextResponse.json(branch);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    // ✅ ป้องกันส่งค่าที่ Prisma ไม่รองรับ
    const data = {
      name: body.name,
      slug: body.slug,
      location: body.location,
      imageUrl: body.imageUrl,
      isActive: body.isActive ?? true,
    };

    const updated = await prisma.branch.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH /branch error:", err);
    return NextResponse.json(
      { error: err.message || "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}