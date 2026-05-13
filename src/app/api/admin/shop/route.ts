import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ==================================
// GET — Shops + Tags (Global Tag Model)
// ==================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const takeParam = searchParams.get("take");

    const pageSize = takeParam ? parseInt(takeParam) : 20;
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * pageSize;

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

    // 1️⃣ โหลดร้านค้าตามเงื่อนไข
    const shopRecords = await prisma.shop.findMany({
      where,
      include: {
        category: true,
        branch: true,
      },
      orderBy: { createdAt: "asc" },
      skip,
      take: pageSize,
    });

    const ids = shopRecords.map((s) => s.id);

    // 2️⃣ โหลด tagRelation ทั้งหมดของร้านเหล่านี้
    const tagRows = await prisma.tagRelation.findMany({
      where: {
        targetType: "shop",
        targetId: { in: ids },
      },
      include: { tag: true },
    });

    // 3️⃣ จัดกลุ่ม tags ต่อร้าน เพื่อ include ไปใน object สุดท้าย
    const tagMap: Record<string, any[]> = {};
    for (const row of tagRows) {
      if (!tagMap[row.targetId]) tagMap[row.targetId] = [];
      tagMap[row.targetId].push({
        id: row.tag.id,
        name: row.tag.name,
      });
    }

    // 4️⃣ รวม tags เข้าไปใน shop object
    const shops = shopRecords.map((shop) => ({
      ...shop,
      tags: tagMap[shop.id] || [],
    }));

    // 5️⃣ โหลด branch/category + count
    const [total, branches, categories] = await Promise.all([
      prisma.shop.count({ where }),
      prisma.branch.findMany({
        select: {
          id: true,
          name: true,
          _count: { select: { shops: true } },
        },
      }),
      prisma.shopCategory.findMany({
        select: {
          id: true,
          name: true,
          _count: { select: { shops: true } },
        },
      }),
    ]);

    return NextResponse.json({
      shops,
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
      branches,
      categories,
    });

  } catch (error: any) {
    console.error("Error fetching shops:", error);
    return NextResponse.json(
      { error: "Failed to fetch shops", details: error.message },
      { status: 500 }
    );
  }
}

// ==================================
// POST — Create Shop (tags assign ผ่าน TagSelector API)
// ==================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      logoUrl,
      imageUrl,
      description,
      phone,
      hours = [],
      zone,
      location,
      categoryId,
      branchId,
      tags = [],
      customRate,
    } = body;

    // 1) create shop
    const shop = await prisma.shop.create({
      data: {
        name: name.trim(),
        logoUrl: logoUrl || null,
        imageUrl: imageUrl || null,
        description: description || null,
        phone: phone || null,
        hours: {
          create: hours
        },
        zone: zone || null,
        location: location || null,
        categoryId: categoryId || null,
        branchId: branchId || null,
        customRate:
          customRate === '' || customRate === undefined
            ? null
            : Number(customRate),
      },
    });

    // 2) assign tags
    if (tags.length > 0) {
      await prisma.tagRelation.createMany({
        data: tags.map((tagId: string) => ({
          tagId,
          targetId: shop.id,
          targetType: "shop",
        })),
      });
    }

    return NextResponse.json(shop);
  } catch (error: any) {
    console.error("Error creating shop:", error);
    return NextResponse.json(
      { error: "Failed to create shop", details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// ==================================
// DELETE — Delete Shop + TagRelations
// ==================================
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get("id");

    if (!shopId)
      return NextResponse.json({ error: "Shop ID is required" }, { status: 400 });

    // 1) delete tagRelation first
    await prisma.tagRelation.deleteMany({
      where: { targetType: "shop", targetId: shopId },
    });

    // 2) delete shop
    await prisma.shop.delete({ where: { id: shopId } });

    return NextResponse.json({ message: "Shop deleted successfully" });

  } catch (error: any) {
    console.error("Error deleting shop:", error);
    return NextResponse.json(
      { error: "Failed to delete shop", details: error.message },
      { status: 500 }
    );
  }
}
