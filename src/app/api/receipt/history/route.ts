import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authConfig } from "@/lib/auth.config";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 20);
  const skip = (page - 1) * limit;

  const userId = session.user.id;

  const totalCount = await prisma.receipt.count({
    where: { userId },
  });

  const totalPages = Math.ceil(totalCount / limit);

  // ✅ ตรวจสอบว่ามี pointBalance หรือยัง
  let balanceRecord = await prisma.pointBalance.findUnique({ where: { userId } });
  if (!balanceRecord) {
    balanceRecord = await prisma.pointBalance.create({
      data: { userId, balance: 0 },
    });
  }

  // ✅ ดึงข้อมูลใบเสร็จทั้งหมดของ user
  const receipts = await prisma.receipt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
    select: {
      id: true,
      amount: true,
      status: true,
      rejectReason: true,
      createdAt: true,
      fileUrl: true,
      shop: { select: { name: true } },
      branch: { select: { name: true } },
      pointTransactions: {
        where: { referenceType: "RECEIPT" },
        select: { amount: true },
      },
    },
  });

  // ✅ จัดรูปแบบข้อมูลให้ frontend ใช้งานง่าย
  const formattedReceipts = receipts.map((r) => ({
    id: r.id,
    amount: r.amount,
    status: r.status,
    rejectReason: r.rejectReason,
    createdAt: r.createdAt,
    fileUrl: r.fileUrl,
    shopName: r.shop?.name || "-",
    branchName: r.branch?.name || "-",
    // ✅ ถ้ามีการอนุมัติ จะดึงพอยท์ที่ได้ (กรณีอนุมัติอาจมีหลาย record ก็รวมกัน)
    approvedPoints:
      r.status === "APPROVED"
        ? r.pointTransactions.reduce((sum, p) => sum + p.amount, 0)
        : 0,
  }));

  // ✅ ดึงรายการ pointTransaction ทั้งหมด (กรณีคุณต้องการเก็บไว้ใช้อย่างอื่น)
  const points = await prisma.pointTransaction.findMany({
    where: { userId, referenceType: "RECEIPT" },
    orderBy: { createdAt: "desc" },
    include: {
      receipt: {
        select: {
          id: true,
          amount: true,
          status: true,
          rejectReason: true,
          shop: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
        },
      },
    },
  });

  const formattedPoints = points.map((p) => ({
    id: p.id,
    amount: p.amount,
    type: p.type,
    description: p.description,
    createdAt: p.createdAt,
    referenceType: p.referenceType,
    receipt: p.receipt
      ? {
          amount: p.receipt.amount,
          status: p.receipt.status,
          shopName: p.receipt.shop?.name || "-",
          branchName: p.receipt.branch?.name || "-",
        }
      : null,
  }));

  return NextResponse.json({
    balance: balanceRecord.balance,
    receipts: formattedReceipts,
    totalPages,
  });
}
