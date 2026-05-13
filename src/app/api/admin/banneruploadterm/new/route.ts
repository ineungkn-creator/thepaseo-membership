import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - ดึง bannerupload ทั้งหมด
export async function GET() {
  try {
    const banner = await prisma.bannerUploadTerm.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(banner);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch banner" }, { status: 500 });
  }
}

// POST - สร้าง bannerupload ใหม่
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const bannerupload = await prisma.bannerUploadTerm.create({ data: body });
    return NextResponse.json(bannerupload);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create bannerupload" }, { status: 500 });
  }
}
