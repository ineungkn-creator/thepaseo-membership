import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ GET banner by ID
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // ✅ ต้อง await
  const banner = await prisma.bannerUploadTerm.findUnique({ where: { id } });
  if (!banner) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(banner);
}

// ✅ PATCH banner by ID
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // ✅ ต้อง await
  const body = await req.json();
  const updated = await prisma.bannerUploadTerm.update({ where: { id }, data: body });
  return NextResponse.json(updated);
}

// ✅ DELETE banner by ID
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // ✅ ต้อง await
  await prisma.bannerUploadTerm.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted successfully" });
}
