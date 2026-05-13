import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ==================================
// GET shop + global tags
// ==================================
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const shop = await prisma.shop.findUnique({
      where: { id },
      include: {
        category: true,
        branch: true,
        hours: {
          orderBy: {
            dayOfWeek: "asc"
          }
        }
      },
    });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    if (shop.hours) {
      shop.hours.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    }

    // Load tagRelations → tags
    const tagRows = await prisma.tagRelation.findMany({
      where: { targetType: "shop", targetId: id },
      include: { tag: true },
    });

    const tags = tagRows.map((r) => r.tag);

    return NextResponse.json({
      ...shop,
      tags, // <-- Important
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch shop" }, { status: 500 });
  }
}

// ==================================
// PATCH shop
// ==================================
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

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
    tags,
    customRate,
  } = body;

  // 1) update shop info
  const shop = await prisma.shop.update({
    where: { id },
    data: {
      name,
      logoUrl,
      imageUrl,
      description,
      phone,
      zone,
      location,
      categoryId,
      branchId,
      customRate:
        customRate === '' || customRate === undefined
          ? null
          : Number(customRate),
    },
  });

  await prisma.shopHour.deleteMany({
    where: { shopId: id },
  });

  if (hours.length > 0) {
    await prisma.shopHour.createMany({
      data: hours.map((h:any) => ({
        shopId: id,
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
        isClosed: h.isClosed,
      })),
    });
  }

  // 2) clear existing tags
  await prisma.tagRelation.deleteMany({
    where: { targetId: id, targetType: "shop" },
  });

  // 3) re-add tags
  if (tags && tags.length > 0) {
    await prisma.tagRelation.createMany({
      data: tags.map((tagId: string) => ({
        tagId,
        targetId: id,
        targetType: "shop",
      })),
    });
  }

  return NextResponse.json(shop);
}


// ==================================
// DELETE shop + remove tag relations
// ==================================
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Remove all tag relations for shop
    await prisma.tagRelation.deleteMany({
      where: { targetType: "shop", targetId: id },
    });

    // Delete shop
    await prisma.shop.delete({
      where: { id },
    });

    await prisma.shopHour.deleteMany({
      where: { shopId: id },
    });

    return NextResponse.json({ message: "Shop deleted" });
  } catch (error:any) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update shop", details: error.message },
      { status: 500 }
    );
  }
}
