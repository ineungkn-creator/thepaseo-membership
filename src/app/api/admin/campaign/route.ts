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
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import {
  hasPermission,
  PERMISSIONS,
} from "@/lib/auth/permissions";

const prisma = new PrismaClient();

// ✅ GET: ดึง campaigns ทั้งหมด
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          branches: true,
          shops: true,
          coupons: {
            select: { id: true, name: true, code: true, expiresAt: true },
          },
          _count: { select: { participations: true } },
        },
      }),
      prisma.campaign.count(),
    ]);

    return NextResponse.json({
      data: campaigns,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching campaigns:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ POST: สร้าง campaign ใหม่ (ไม่มีการสร้าง coupon แล้ว)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session) return new Response("Unauthorized", { status: 401 });

    if (!hasPermission(session.user.role, PERMISSIONS.CAMPAIGN_CREATE)) {
      return new Response("Forbidden", { status: 403 });
    }

    const formData = await req.formData();

    const name = formData.get("name")?.toString() || "";
    const linkShare = formData.get("linkShare")?.toString() || "";
    const code = formData.get("code")?.toString() || null;
    const description = formData.get("description")?.toString() || "";
    const terms = formData.get("terms")?.toString() || "";
    const pointCost = parseInt(formData.get("pointCost")?.toString() || "0");
    const pointEarn = parseInt(formData.get("pointEarn")?.toString() || "0");
    const quantity = parseInt(formData.get("quantity")?.toString() || "0");
    const maxPerUser = parseInt(formData.get("maxPerUser")?.toString() || "1");

    const startDateRaw = formData.get("startDate")?.toString() || "";
    const endDateRaw = formData.get("endDate")?.toString() || "";
    const startDate = startDateRaw ? new Date(startDateRaw) : null;
    const endDate = endDateRaw ? new Date(endDateRaw) : null;

    const shopIds = formData.getAll("shopIds[]") as string[];
    const branchIds = formData.getAll("branchIds[]") as string[];

    // ✅ Handle file upload
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

    // ✅ Create Campaign
    const campaign = await prisma.campaign.create({
      data: {
        code,
        name,
        linkShare,
        description,
        terms,
        pointCost,
        pointEarn,
        quantity,
        maxPerUser,
        startDate: startDate || new Date(),
        endDate: endDate || new Date(),
        imageUrl,
        shops: { connect: shopIds.map((id) => ({ id })) },
        branches: { connect: branchIds.map((id) => ({ id })) },
      },
      include: {
        shops: true,
        branches: true,
      },
    });

    return NextResponse.json({ campaign });
  } catch (error: any) {
    console.error("❌ Error creating campaign:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}