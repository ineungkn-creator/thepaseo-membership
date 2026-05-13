// app/api/shop/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || undefined;
    const branchId = searchParams.get("branchId") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;


    const where = {
      AND: [
        branchId ? { branchId } : {},
        categoryId ? { categoryId } : {},
        search ? { name: { contains: search } } : {},
      ],
    };

    const shops = await prisma.shop.findMany({
      where,
      include: { category: true, branch: true },
      orderBy: { name: "asc" },
    });

    const baseUrl = process.env.STORAGE_BASE_URL;

    const formatted = shops.map((s) => ({
      ...s,
      logoUrl:
        s.logoUrl && !s.logoUrl.startsWith("http")
          ? `${baseUrl}${s.logoUrl}`
          : s.logoUrl,
    }));


    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Error fetching shops:", error);
    return NextResponse.json(
      { error: "Failed to fetch shops", details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
