import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  getUploadFolder,
  getLocalPath,
  ensureDir,
  makePublicUrl,
} from "@/lib/storage";
import fs from "fs";

const prisma = new PrismaClient();

// ✅ GET: ดึงคูปองทั้งหมด (พร้อม pagination)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        branches: true,
        shops: true,
        campaign: { select: { id: true, name: true } },
        users: true,
      },
    }),
    prisma.coupon.count(),
  ]);

  const couponIds = coupons.map((c) => c.id);

  const tagRows = await prisma.tagRelation.findMany({
    where: {
      targetId: { in: couponIds },
      targetType: "coupon",
    },
    include: { tag: true },
  });

  // group tags ตาม couponIds
  const tagsByCoupon: Record<string, any[]> = {};
  for (const row of tagRows) {
    if (!tagsByCoupon[row.targetId]) tagsByCoupon[row.targetId] = [];
    tagsByCoupon[row.targetId].push(row.tag);
  }

  // รวม tags เข้า coupon
  const couponsWithTags = coupons.map((c) => ({
    ...c,
    tags: tagsByCoupon[c.id] || [],
  }));

  return NextResponse.json({
    data: couponsWithTags,
    pagination: {
      page,
      totalPages: Math.ceil(total / limit),
      total,
    },
  });
}

// ✅ POST: สร้างคูปองใหม่
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = formData.get("name")?.toString() || "";
    const code = formData.get("code")?.toString() || `CPN-${Date.now()}`;
    const description = formData.get("description")?.toString() || null;
    const terms = formData.get("terms")?.toString() || null;
    const pointCost = parseInt(formData.get("pointCost")?.toString() || "0");
    const pointEarn = parseInt(formData.get("pointEarn")?.toString() || "0");
    const quantity = formData.get("quantity")
      ? parseInt(formData.get("quantity")!.toString())
      : null;
    const maxPerUser = formData.get("maxPerUser")
      ? parseInt(formData.get("maxPerUser")!.toString())
      : null;

    const startDateRaw = formData.get("startDate")?.toString() || null;
    const endDateRaw = formData.get("endDate")?.toString() || null;
    const expiresAtRaw = formData.get("expiresAt")?.toString() || null;

    const startDate = startDateRaw ? new Date(startDateRaw) : null;
    const endDate = endDateRaw ? new Date(endDateRaw) : null;
    const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;

    const campaignId = formData.get("campaignId")?.toString() || null;
    const autoAssign = formData.get("autoAssign") === "true";

    // ✅ Handle file upload
    const file = formData.get("file") as File;
    let imageUrl: string | null = null;

    if (file && file.size > 0) {
      const folder = getUploadFolder("coupon");
      const filename = `${Date.now()}-${file.name}`;

      const localPath = getLocalPath(folder, filename);
      ensureDir(localPath);

      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(localPath, buffer);

      imageUrl = makePublicUrl(folder, filename);
    }

    const tagsRaw = formData.get("tags")?.toString() || "[]";
    const tags: string[] = JSON.parse(tagsRaw);

    const shopIds = formData.getAll("shopIds[]") as string[];
    const branchIds = formData.getAll("branchIds[]") as string[];

    // ✅ ตรวจสอบ "จุดบริการ (Redemption)"
    const isRedemption = shopIds.includes("redemption");

    // ✅ Connect เฉพาะร้านค้าที่เลือกจริง
    const validShopIds = shopIds.filter((id) => id !== "redemption");

    // ✅ บันทึกลงฐานข้อมูล
    const coupon = await prisma.coupon.create({
      data: {
        code,
        name,
        description,
        terms,
        pointCost,
        pointEarn,
        quantity,
        maxPerUser,
        startDate,
        endDate,
        expiresAt: expiresAt!,
        campaignId,
        autoAssign,
        imageUrl,
        isRedemption, // ✅ เพิ่มฟิลด์นี้
        shops: validShopIds.length > 0 ? { connect: validShopIds.map((id) => ({ id })) } : undefined,
        branches: branchIds.length > 0 ? { connect: branchIds.map((id) => ({ id })) } : undefined,
      },
      include: {
        campaign: true,
        shops: true,
        branches: true,
      },
    });

    if (tags.length > 0) {
      await prisma.tagRelation.createMany({
        data: tags.map((tagId) => ({
          tagId,
          targetId: coupon.id,
          targetType: "coupon",
        })),
      });
    }

    return NextResponse.json(coupon);
  } catch (error: any) {
    console.error("❌ Error creating coupon:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
