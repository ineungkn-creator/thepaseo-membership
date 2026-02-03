// app/api/admin/campaign/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  getUploadFolder,
  getLocalPath,
  ensureDir,
  makePublicUrl,
} from "@/lib/storage";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// ✅ GET: campaign detail
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        shops: true,
        branches: true,
        participations: {
          include: { user: { select: { id: true, name: true, phone: true, email: true } } },
        },
        referralLogs: true,
        coupons: true, // ใช้ relation "CampaignCoupons" ที่คุณเพิ่มไว้ใน model
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const formData = await req.formData();

    const startDateRaw = formData.get("startDate")?.toString() || "";
    const endDateRaw = formData.get("endDate")?.toString() || "";

    const data: any = {
      code: formData.get("code")?.toString() || undefined,
      name: formData.get("name")?.toString() || undefined,
      linkShare: formData.get("linkShare")?.toString() || undefined,
      description: formData.get("description")?.toString() || undefined,
      terms: formData.get("terms")?.toString() || undefined,
      pointCost: parseInt(formData.get("pointCost")?.toString() || "0"),
      pointEarn: parseInt(formData.get("pointEarn")?.toString() || "0"),
      quantity: parseInt(formData.get("quantity")?.toString() || "0"),
      maxPerUser: parseInt(formData.get("maxPerUser")?.toString() || "1"),
      startDate: startDateRaw ? new Date(startDateRaw) : null,
      endDate: endDateRaw ? new Date(endDateRaw) : null,
    };

    // Handle file upload
    const file = formData.get("file") as File | null;
    let imageUrl: string | undefined;

    if (file && file.size > 0) {
      const folder = getUploadFolder("campaign");
      const fileName = `${Date.now()}-${file.name}`;
      const localPath = getLocalPath(folder, fileName);

      ensureDir(localPath); 
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(localPath, buffer);

      imageUrl = makePublicUrl(folder, fileName);
    }

    // multi-select
    const shopIds = formData.getAll("shopIds[]") as string[];
    const branchIds = formData.getAll("branchIds[]") as string[];

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...data,
        shops: {
          set: shopIds.map((id) => ({ id })),
        },
        branches: {
          set: branchIds.map((id) => ({ id })),
        },
      },
      include: {
        shops: true,
        branches: true,
      },
    });

    return NextResponse.json(campaign);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    // ดึงข้อมูล campaign ก่อน
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { coupons: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // ถ้ามี imageUrl → ลบไฟล์ออกจาก public/uploads
    if (campaign.imageUrl) {
      const filePath = path.join(process.cwd(), "public", campaign.imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // ✅ Prisma จะ handle relation cascade ถ้า schema ตั้งค่าไว้
    // ถ้าไม่ ให้ใช้ disconnect / deleteMany manual
    await prisma.$transaction([
      prisma.userCoupon.deleteMany({
        where: { couponId: { in: campaign.coupons.map((c) => c.id) } },
      }),
      prisma.coupon.deleteMany({ where: { campaignId: id } }),
      prisma.campaignParticipation.deleteMany({ where: { campaignId: id } }),
      prisma.campaign.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true, message: "Campaign deleted" });
  } catch (error) {
    console.error("❌ Error deleting campaign:", error);
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}
