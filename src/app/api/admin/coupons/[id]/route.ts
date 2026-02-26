import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  getUploadFolder,
  getLocalPath,
  ensureDir,
  makePublicUrl,
} from "@/lib/storage";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import {
  hasPermission,
  PERMISSIONS,
} from "@/lib/auth/permissions";

const prisma = new PrismaClient();

// ✅ GET: ดึงคูปองเดี่ยว
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const coupon = await prisma.coupon.findUnique({
    where: { id },
    include: {
      shops: true,
      branches: true,
      campaign: { select: { id: true, name: true } },
      users: true,
    },
  });

  if (!coupon) {
    return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  }

  // โหลด Tags ของ coupon นี้
  const tagRows = await prisma.tagRelation.findMany({
    where: {
      targetId: id,
      targetType: "coupon",   // ←❗ แก้จาก reward เป็น coupon
    },
    include: { tag: true },
  });

  const tagIds = tagRows.map((r) => r.tagId);
  const tags = tagRows.map((r) => r.tag);

  return NextResponse.json({
    ...coupon,
    tagIds,
    tags,
  });
}


// ✅ PUT: อัปเดตคูปอง (รองรับ Redemption)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authConfig);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const role = session.user.role;

    if (!hasPermission(role, PERMISSIONS.COUPONS_EDIT)) {
      return new Response("Forbidden", { status: 403 });
    }
    const { id } = await params;
    const formData = await req.formData();

    const name = formData.get("name")?.toString() || "";
    const code = formData.get("code")?.toString() || undefined;
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

    const file = formData.get("file") as File | null;
    let imageUrl: string | undefined;

    if (file && file.size > 0) {
      const folder = getUploadFolder("coupon");
      const fileName = `${Date.now()}-${file.name}`;
      const localPath = getLocalPath(folder, fileName);

      ensureDir(localPath); 
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(localPath, buffer);

      imageUrl = makePublicUrl(folder, fileName);
    }

    const tagsRaw = formData.get("tags")?.toString() || "[]";
    const tags: string[] = JSON.parse(tagsRaw);

    // ✅ multi-select
    const shopIds = formData.getAll("shopIds[]") as string[];
    const branchIds = formData.getAll("branchIds[]") as string[];

    // ✅ ตรวจสอบ “จุดบริการ (Redemption)”
    const isRedemption = shopIds.includes("redemption");
    const validShopIds = shopIds.filter((id) => id !== "redemption");

    // ✅ เตรียมข้อมูลอัปเดต
    const updateData: any = {
      name,
      code,
      description,
      terms,
      pointCost,
      pointEarn,
      quantity,
      maxPerUser,
      startDate,
      endDate,
      expiresAt,
      campaignId,
      autoAssign,
      isRedemption,
    };

    if (imageUrl) updateData.imageUrl = imageUrl;

    // ✅ จัดการ relations
    if (formData.has("shopIds[]")) {
      updateData.shops = validShopIds.length
        ? { set: validShopIds.map((id) => ({ id })) }
        : { set: [] };
    }

    if (formData.has("branchIds[]")) {
      updateData.branches = branchIds.length
        ? { set: branchIds.map((id) => ({ id })) }
        : { set: [] };
    }

    // ✅ อัปเดตในฐานข้อมูล
    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
      include: {
        campaign: true,
        shops: true,
        branches: true,
      },
    });

    // delete old tags
    await prisma.tagRelation.deleteMany({
      where: { targetId: id, targetType: "coupon" },
    });

    // add new tags
    if (tags.length > 0) {
      await prisma.tagRelation.createMany({
        data: tags.map((tagId) => ({
          tagId,
          targetId: id,
          targetType: "coupon",
        })),
      });
    }

    return NextResponse.json(updatedCoupon);
  } catch (error: any) {
    console.error("❌ Error updating coupon:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ DELETE: ลบคูปอง (พร้อมลบความสัมพันธ์)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: { users: true },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    // ✅ ลบความสัมพันธ์ UserCoupon
    await prisma.userCoupon.deleteMany({ where: { couponId: id } });

    // ✅ ลบภาพใน public (ถ้ามี)
    if (coupon.imageUrl) {
      const filePath = path.join(process.cwd(), "public", coupon.imageUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    // ✅ ลบ Coupon จริง
    await prisma.coupon.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ Error deleting coupon:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
