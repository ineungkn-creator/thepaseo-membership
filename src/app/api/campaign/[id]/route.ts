import { NextResponse } from "next/server";
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
import path from "path";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        shops: true,
        branches: true,
        participations: true,
        coupons: true,
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


export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: campaignId } = await params;

    const session = await getServerSession(authConfig);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) {
      return NextResponse.json({ error: "campaign not found" }, { status: 404 });
    }

    // <-- เปลี่ยนเป็น findFirst แทน findUnique ที่ต้องอิงชื่อ unique index
    const existing = await prisma.campaignParticipation.findFirst({
      where: {
        campaignId,
        userId,
      },
    });

    if (existing) {
      return NextResponse.json({ error: "You already joined this campaign" }, { status: 400 });
    }

    // สร้าง participation — จับกรณีแข่งกันสร้าง (unique constraint race)
    try {
      const participation = await prisma.campaignParticipation.create({
        data: {
          campaignId,
          userId,
          joinedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Joined campaign successfully",
        participation,
      });
    } catch (err: any) {
      // ถ้าเกิด unique constraint violation (ใครสักคนเพิ่ง insert ไปก่อนเรา)
      // Prisma error code สำหรับ unique constraint คือ P2002
      if (err?.code === "P2002") {
        return NextResponse.json({ error: "You already joined this campaign" }, { status: 400 });
      }
      throw err;
    }
  } catch (error) {
    console.error("❌ POST /api/campaign/[id] error:", error);
    return NextResponse.json({ error: "Failed to join campaign" }, { status: 500 });
  }
}


// ✅ PUT: update campaign
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const formData = await req.formData();

    const startDateRaw = formData.get("startDate")?.toString() || "";
    const endDateRaw = formData.get("endDate")?.toString() || "";

    const code = formData.get("code")?.toString() || "";
    const name = formData.get("name")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const terms = formData.get("terms")?.toString() || "";

    const pointCost = parseInt(formData.get("pointCost")?.toString() || "0");
    const pointEarn = parseInt(formData.get("pointEarn")?.toString() || "0");
    const quantity = parseInt(formData.get("quantity")?.toString() || "0");
    const maxPerUser = parseInt(formData.get("maxPerUser")?.toString() || "1");

    const startDate = startDateRaw ? new Date(startDateRaw) : null;
    const endDate = endDateRaw ? new Date(endDateRaw) : null;

    const shopIds = formData.getAll("shopIds[]") as string[];
    const branchIds = formData.getAll("branchIds[]") as string[];

    // ✅ handle file upload (อัปเดตรูปใหม่ถ้ามี)
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

    // ✅ update campaign
    const updated = await prisma.campaign.update({
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
        ...(imageUrl ? { imageUrl } : {}),

        // เชื่อม shop/branch ใหม่ (replace ทั้งหมด)
        shops: {
          set: [],
          connect: shopIds.map((id) => ({ id })),
        },
        branches: {
          set: [],
          connect: branchIds.map((id) => ({ id })),
        },
      },
      include: { shops: true, branches: true },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}