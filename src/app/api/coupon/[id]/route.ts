import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";

import {
  getUploadFolder,
  getLocalPath,
  ensureDir,
  makePublicUrl,
} from "@/lib/storage";

import fs from "fs";

const prisma = new PrismaClient();

/* ============================================================
   ✅ GET /api/coupon/[id]
   ใช้แสดงรายละเอียดคูปอง + เช็คสิทธิ์ (NO SIDE EFFECT)
============================================================ */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authConfig);
    const userId = session?.user?.id || null;

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        shops: true,
        branches: true,
        campaign: true,
        _count: { select: { users: true } },
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const now = new Date();

    const isExpired = coupon.endDate ? coupon.endDate < now : false;
    const isFull =
      coupon.quantity !== null && coupon._count.users >= coupon.quantity;

    // 🔹 แต้มของ user (แค่เอาไปแสดง / เช็ค UI)
    let pointBalance = 0;
    if (userId) {
      const record = await prisma.pointBalance.findUnique({
        where: { userId },
      });
      pointBalance = record?.balance ?? 0;
    }

    // 🔹 ตรวจสอบว่า user รับไปแล้วกี่ครั้ง
    let receivedCount = 0;
    if (userId) {
      receivedCount = await prisma.userCoupon.count({
        where: { userId, couponId: coupon.id },
      });
    }

    const maxPerUser = coupon.maxPerUser ?? 1;
    const isReceived = receivedCount >= maxPerUser;

    // 🔹 label สถานที่
    let locationLabel = "ไม่ระบุ";
    if (coupon.isRedemption) {
      locationLabel = "🎁 จุดบริการ (Redemption)";
    } else if (coupon.shops.length > 0) {
      locationLabel = `ร้านค้า: ${coupon.shops.map((s) => s.name).join(", ")}`;
    } else if (coupon.branches.length > 0) {
      locationLabel = `สาขา: ${coupon.branches.map((b) => b.name).join(", ")}`;
    }

    const canReceive =
      !isExpired &&
      !isFull &&
      !isReceived &&
      pointBalance >= (coupon.pointCost ?? 0);

    return NextResponse.json({
      id: coupon.id,
      name: coupon.name,
      description: coupon.description,
      terms: coupon.terms,
      imageUrl: coupon.imageUrl,
      pointCost: coupon.pointCost ?? 0,
      pointEarn: coupon.pointEarn ?? 0,
      quantity: coupon.quantity,
      maxPerUser: coupon.maxPerUser,
      receivedCount,
      totalReceived: coupon._count.users,
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      isExpired,
      isFull,
      isReceived,
      canReceive,
      pointBalance,
      campaign: coupon.campaign,
      locationLabel,
    });
  } catch (error) {
    console.error("❌ GET /api/coupon/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ============================================================
   ❌ POST /api/coupon/[id]
   ปิดการใช้งาน (ต้องใช้ /join เท่านั้น)
============================================================ */
export async function POST() {
  return NextResponse.json(
    {
      error: "Method Not Allowed. Please use POST /api/coupon/[id]/join",
    },
    { status: 405 }
  );
}

/* ============================================================
   ✅ PUT /api/coupon/[id]
   แก้ไขข้อมูลคูปอง (ADMIN ONLY)
============================================================ */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authConfig);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await req.formData();

    const code = formData.get("code")?.toString() || "";
    const name = formData.get("name")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const terms = formData.get("terms")?.toString() || "";
    const pointCost = parseInt(formData.get("pointCost")?.toString() || "0");
    const pointEarn = parseInt(formData.get("pointEarn")?.toString() || "0");
    const quantity = parseInt(formData.get("quantity")?.toString() || "0");
    const maxPerUser = parseInt(formData.get("maxPerUser")?.toString() || "1");
    const campaignId = formData.get("campaignId")?.toString() || null;
    const autoAssign = formData.get("autoAssign") === "true";

    const startDateRaw = formData.get("startDate")?.toString() || "";
    const endDateRaw = formData.get("endDate")?.toString() || "";
    const startDate = startDateRaw ? new Date(startDateRaw) : null;
    const endDate = endDateRaw ? new Date(endDateRaw) : null;

    // 🔹 handle image upload
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

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        code,
        name,
        description,
        terms,
        pointCost,
        pointEarn,
        quantity,
        maxPerUser,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        campaignId,
        autoAssign,
        ...(imageUrl ? { imageUrl } : {}),
      },
      include: {
        campaign: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("❌ PUT /api/coupon/[id] error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
