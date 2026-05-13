//api/admin/receipts/
import { NextResponse } from "next/server";
import { PrismaClient, PointType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";

import {
  getUploadFolder,
  getLocalPath,
  ensureDir,
  makePublicUrl,
} from "@/lib/storage";

import fs from "fs";

import { sendLinePointCard } from "@/lib/lineNotify";

const prisma = new PrismaClient();

// ✅ GET: ดึงใบเสร็จที่รออนุมัติ
export async function GET() {
  const receipts = await prisma.receipt.findMany({
    where: { status: "PENDING" },
    include: { user: true, shop: true, branch: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(receipts);
}

// ✅ PATCH: อัปเดตสถานะใบเสร็จ (อนุมัติ / ปฏิเสธ)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, status, rejectReason, amount, shopId, branchId, receiptNumber } = await req.json();
    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const reviewedById = session.user.id;

    const duplicate = await prisma.receipt.findFirst({
      where: {
        shopId,
        receiptNumber,
        NOT: {
          id,
        },
        status: {
          in: ["PENDING", "APPROVED"],
        },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "เลขใบเสร็จนี้ถูกใช้แล้ว" },
        { status: 400 }
      );
    }

    const receipt = await prisma.receipt.update({
      where: { id },
      data: {
        status,
        reviewedBy: reviewedById,
        reviewedAt: new Date(),
        ...(status === "REJECTED" ? { rejectReason } : { rejectReason: null }),
        ...(amount ? { amount } : {}),
        ...(shopId ? { shopId } : {}),
        ...(branchId ? { branchId } : {}),
      },
      include: { user: true, shop: true, branch: true },
    });

    // ✅ ถ้าอนุมัติ → คำนวณพอยท์และบันทึก
    if (status === "APPROVED" && receipt.user) {
      const setting = await prisma.pointSetting.findFirst();
      if (!setting) {
        return NextResponse.json({ error: "Point setting not found" }, { status: 500 });
      }

      const pointsToAdd =
        Math.floor(receipt.amount / setting.receiptRateAmount) *
        setting.receiptRatePoints;

      // ⭐ คำนวณวันหมดอายุ
      let expiresAt: Date | null = null;
      if (setting.pointExpireYears && setting.pointExpireYears > 0) {
        expiresAt = new Date();
        expiresAt.setFullYear(
          expiresAt.getFullYear() + setting.pointExpireYears
        );
      }

      // ✅ ตรวจสอบหรือสร้าง PointBalance
      let pointBalance = await prisma.pointBalance.findUnique({
        where: { userId: receipt.userId },
      });
      if (!pointBalance) {
        pointBalance = await prisma.pointBalance.create({
          data: { userId: receipt.userId, balance: 0 },
        });
      }

      const updatedBalance = pointBalance.balance + pointsToAdd;

      await prisma.$transaction(async (tx) => {
        // update spending
        await tx.user.update({
          where: { id: receipt.userId },
          data: {
            totalSpending: { increment: receipt.amount },
          },
        });

        // update balance
        await tx.pointBalance.update({
          where: { userId: receipt.userId },
          data: { balance: updatedBalance },
        });

        // ⭐ create wallet (FIFO)
        await tx.pointWallet.create({
          data: {
            userId: receipt.userId,
            source: "RECEIPT",
            points: pointsToAdd,
            expiresAt, // ✅ ตอนนี้มีตัวแปรแล้ว
          },
        });

        // log transaction
        await tx.pointTransaction.create({
          data: {
            userId: receipt.userId,
            type: PointType.RECEIPT,
            referenceType: "RECEIPT",
            amount: pointsToAdd,
            balanceAfter: updatedBalance,
            referenceId: receipt.id,
            receiptId: receipt.id,
            shopId: receipt.shopId,
            branchId: receipt.branchId,
            description: "พอยท์จากการส่งใบเสร็จ",
          },
        });
      });

      // ✅ แจ้งเตือน LINE เฉพาะตอน “ได้รับแต้ม”
      //await sendLinePointCard(receipt.userId, {
      //  type: "ADD",
      //  amount: pointsToAdd,
      //  source: `ใบเสร็จร้าน ${receipt.shop?.name || ""}`,
      //  balance: updatedBalance,
      //});
    }

    return NextResponse.json({ success: true, receipt });
  } catch (error) {
    console.error("❌ PATCH receipts error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ POST: Admin เพิ่มใบเสร็จและอนุมัติทันที
export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    const userId = formData.get("userId") as string;
    const amount = parseInt(formData.get("amount") as string, 10);
    const branchId = formData.get("branchId") as string;
    const shopId = formData.get("shopId") as string;
    const receiptNumber = formData.get("receiptNumber") as string | null;
    const receiptDate = formData.get("receiptDate") as string | null;
    const receiptTime = formData.get("receiptTime") as string | null;

    if (!userId || !amount || !branchId || !shopId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // -------------------------------------------------------------
    // 📌 Upload file → ใช้ Storage System กลาง (Cloud-ready)
    // -------------------------------------------------------------
    let fileUrl: string | null = null;
    let fileType: "IMAGE" | "PDF" | null = null;

    if (file && file.size > 0) {
      const folder = getUploadFolder("receipts"); // อ่านจาก ENV
      const fileName = `${Date.now()}-${file.name}`;

      const localPath = getLocalPath(folder, fileName);
      ensureDir(localPath);

      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(localPath, buffer);

      fileUrl = makePublicUrl(folder, fileName);
      fileType = file.type.toLowerCase().startsWith("image/") ? "IMAGE" : "PDF";
    }

    const reviewedById = session.user.id;

    // -------------------------------------------------------------
    // 📌 บันทึกใบเสร็จ (อนุมัติทันที)
    // -------------------------------------------------------------
    const receipt = await prisma.receipt.create({
      data: {
        userId,
        amount,
        reviewedAt: new Date(),
        status: "APPROVED",
        reviewedBy: reviewedById,
        branchId,
        shopId,
        receiptNumber,
        receiptDate: receiptDate ? new Date(receiptDate) : null,
        receiptTime,
        ...(fileUrl && { fileUrl }),
        ...(fileType && { fileType }),
      },
      include: { shop: true, branch: true },
    });

    // -------------------------------------------------------------
    // 📌 คำนวณและอัปเดตแต้ม
    // -------------------------------------------------------------
    const setting = await prisma.pointSetting.findFirst();
    if (!setting) {
      return NextResponse.json({ error: "Point setting not found" }, { status: 500 });
    }

    // ⭐ คำนวณวันหมดอายุ
    let expiresAt: Date | null = null;
    if (setting.pointExpireYears && setting.pointExpireYears > 0) {
      expiresAt = new Date();
      expiresAt.setFullYear(
        expiresAt.getFullYear() + setting.pointExpireYears
      );
    }

    const pointsToAdd =
      Math.floor(receipt.amount / setting.receiptRateAmount) * setting.receiptRatePoints;

    let pointBalance = await prisma.pointBalance.findUnique({ where: { userId } });
    if (!pointBalance) {
      pointBalance = await prisma.pointBalance.create({
        data: { userId, balance: 0 },
      });
    }

    const updatedBalance = pointBalance.balance + pointsToAdd;

    await prisma.$transaction(async (tx) => {
      await tx.pointBalance.update({
        where: { userId },
        data: { balance: updatedBalance },
      });

      await tx.pointTransaction.create({
        data: {
          userId,
          type: PointType.RECEIPT,
          referenceType: "RECEIPT",
          amount: pointsToAdd,
          balanceAfter: updatedBalance,
          referenceId: receipt.id,
          receiptId: receipt.id,
          shopId,
          branchId,
          description: "พอยท์จากการส่งใบเสร็จ",
        },
      });

      await tx.pointWallet.create({
        data: {
          userId: receipt.userId,
          source: "RECEIPT",
          points: pointsToAdd,
          expiresAt, // ⭐ สำคัญ
        },
      });

    });

    // แจ้งเตือน LINE
    //await sendLinePointCard(userId, {
    //  type: "ADD",
    //  amount: pointsToAdd,
    //  source: `ใบเสร็จร้าน ${receipt.shop?.name || ""}`,
    //  balance: updatedBalance,
    //});

    return NextResponse.json({ success: true, receipt });

  } catch (error) {
    console.error("❌ POST admin receipts error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
