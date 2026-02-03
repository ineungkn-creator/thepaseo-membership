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

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // 👈 ต้อง await
    const formData = await req.formData();

    // อ่าน fields (อาจเป็น undefined)
    const name = formData.get("name")?.toString();
    const linkShare = formData.get("linkShare")?.toString();
    const description = formData.get("description")?.toString();
    const terms = formData.get("terms")?.toString();
    const pointCostStr = formData.get("pointCost")?.toString();
    const pointEarnStr = formData.get("pointEarn")?.toString();
    const quantityStr = formData.get("quantity")?.toString();
    const maxPerUserStr = formData.get("maxPerUser")?.toString();
    const startDateStr = formData.get("startDate")?.toString();
    const endDateStr = formData.get("endDate")?.toString();

    const shopIds = formData.getAll("shopIds[]") as string[];
    const branchIds = formData.getAll("branchIds[]") as string[];

    const isRedemption = shopIds.includes("redemption");
    const validShopIds = shopIds.filter((id) => id !== "redemption");

    // file handling
    const file = formData.get("file") as File;
    let imageUrl: string | null = null;

    if (file && file.size > 0) {
      const folder = getUploadFolder("reward"); // อ่านจาก ENV
      const filename = `${Date.now()}-${file.name}`;

      const localPath = getLocalPath(folder, filename);
      ensureDir(localPath);

      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(localPath, buffer);

      imageUrl = makePublicUrl(folder, filename);
    }

    const tagsRaw = formData.get("tags")?.toString() || "[]";
    const tags: string[] = JSON.parse(tagsRaw);

    // build update object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (linkShare !== undefined) updateData.linkShare = linkShare;
    if (description !== undefined) updateData.description = description;
    if (terms !== undefined) updateData.terms = terms;
    if (pointCostStr !== undefined) updateData.pointCost = parseInt(pointCostStr || "0", 10);
    if (pointEarnStr !== undefined) updateData.pointEarn = parseInt(pointEarnStr || "0", 10);
    if (quantityStr !== undefined) updateData.quantity = parseInt(quantityStr || "0", 10);
    if (maxPerUserStr !== undefined) updateData.maxPerUser = parseInt(maxPerUserStr || "0", 10);
    if (startDateStr) updateData.startDate = new Date(startDateStr);
    if (endDateStr) updateData.endDate = new Date(endDateStr);
    if (imageUrl) updateData.imageUrl = imageUrl;

    updateData.isRedemption = isRedemption;

    if (formData.has("shopIds[]")) {
      updateData.shops = { set: validShopIds.map((id) => ({ id })) };
    }
    if (formData.has("branchIds[]")) {
      updateData.branches = { set: branchIds.map((id) => ({ id })) };
    }

    const reward = await prisma.reward.update({
      where: { id },
      data: updateData,
      include: { shops: true, branches: true },
    });

    // delete old tags
    await prisma.tagRelation.deleteMany({
      where: { targetId: id, targetType: "reward" },
    });

    // add new tags
    if (tags.length > 0) {
      await prisma.tagRelation.createMany({
        data: tags.map((tagId) => ({
          tagId,
          targetId: id,
          targetType: "reward",
        })),
      });
    }

    return NextResponse.json(reward);
  } catch (err: any) {
    console.error("PATCH reward error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const reward = await prisma.reward.findUnique({
      where: { id },
      include: {
        branches: true,
        shops: true,
        participations: { include: { user: true } },
        redemptions: { include: { user: true } },
      },
    });

    const tagRows = await prisma.tagRelation.findMany({
      where: {
        targetId: id,
        targetType: "reward",
      },
      include: { tag: true },
    });

    const tagIds = tagRows.map(r => r.tagId);
    const tags = tagRows.map(r => r.tag);

    if (!reward) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    // ✅ เตรียม label แสดงผล
    let locationLabel = "ไม่ระบุ";
    if (reward.isRedemption) {
      locationLabel = "🎁 จุดบริการ (Redemption)";
    } else if (reward.shops.length > 0) {
      const shopNames = reward.shops.map((s) => s.name).join(", ");
      locationLabel = `ร้านค้า: ${shopNames}`;
    } else if (reward.branches.length > 0) {
      const branchNames = reward.branches.map((b) => b.name).join(", ");
      locationLabel = `สาขา: ${branchNames}`;
    }

    // ✅ เพิ่ม field ใหม่เพื่อให้ frontend ใช้งานง่าย
    const shopIds = reward.isRedemption
      ? ["redemption"]
      : reward.shops.map((s) => s.id);

    const branchIds = reward.branches.map((b) => b.id);

    return NextResponse.json({
      ...reward,
      shopIds,     // ✅ ใช้แทน selectedShops ในหน้าแก้ไข
      branchIds,   // ✅ ใช้แทน selectedBranches
      locationLabel,
      linkShare: reward.linkShare || "",
      tagIds,
      tags,
    });
  } catch (err: any) {
    console.error("GET reward error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 1️⃣ ตรวจสอบว่า reward มีจริงไหม
    const reward = await prisma.reward.findUnique({
      where: { id },
      include: {
        branches: true,
        shops: true,
        redeemHistories: true,
        redemptions: true,
        participations: true,
      },
    });

    if (!reward) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    // 2️⃣ ลบ tagRelations
    await prisma.tagRelation.deleteMany({
      where: { targetId: id, targetType: "reward" },
    });

    // 3️⃣ ลบ relations อื่น ๆ
    await prisma.redeemHistory.deleteMany({ where: { rewardId: id } });
    await prisma.redemption.deleteMany({ where: { rewardId: id } });
    await prisma.rewardParticipation.deleteMany({ where: { rewardId: id } });

    // 4️⃣ เคลียร์ relations shops & branches
    await prisma.reward.update({
      where: { id },
      data: { shops: { set: [] }, branches: { set: [] } },
    });

    // 5️⃣ ลบไฟล์รูป — ใช้ระบบ storage กลาง 💚
    if (reward.imageUrl) {
      try {
        const folder = getUploadFolder("reward"); // ex. "/uploads/admin/reward"

        // extract file name จาก URL
        const fileName = reward.imageUrl.split("/").pop();

        if (fileName) {
          const localPath = getLocalPath(folder, fileName);

          if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath);
          }
        }
      } catch (err) {
        console.warn("⚠️ Failed to delete reward image:", err);
      }
    }

    // 6️⃣ ลบ reward จริง
    await prisma.reward.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Reward deleted successfully",
    });

  } catch (error: any) {
    console.error("❌ DELETE reward error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}