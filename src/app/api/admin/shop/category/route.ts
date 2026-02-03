// app/api/admin/shop/category/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const categories = await prisma.shopCategory.findMany({
    orderBy: {
      sortOrder: "asc", // ✅ เพิ่มตรงนี้
    },
    include: { shops: true },
  });

  return NextResponse.json(categories);
}
