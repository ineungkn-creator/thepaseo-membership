import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// =========================
// GET categories
// =========================
export async function GET() {
  const categories = await prisma.shopCategory.findMany({
    orderBy: {
      sortOrder: "asc",
    },
    include: { shops: true },
  });

  return NextResponse.json(categories);
}

// =========================
// CREATE category
// =========================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, slug, imageUrl, color } = body;

    // check slug first
    const exist = await prisma.shopCategory.findUnique({
      where: { slug },
    });

    if (exist) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.shopCategory.create({
      data: {
        name,
        slug,
        imageUrl,
        color, // ⭐ เพิ่ม
      },
    });

    return NextResponse.json(category);

  } catch (error) {
    console.error("Create category error:", error);

    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}