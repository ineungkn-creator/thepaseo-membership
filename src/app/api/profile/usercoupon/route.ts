//api/profile/usercoupon
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";

const prisma = new PrismaClient();

// ✅ GET: ดึงคูปองทั้งหมดที่ user มี
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const userCoupons = await prisma.userCoupon.findMany({
      where: { userId },
      orderBy: { assignedAt: "desc" },
      include: {
        coupon: {
          include: {
            campaign: { select: { id: true, name: true } },
          },
        },
      },
    });

    // format response
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = 10;
    const skip = (page - 1) * pageSize;
    const now = new Date();

    // 1. ACTIVE (ใกล้หมดอายุบนสุด)
    const active = await prisma.userCoupon.findMany({
      where: {
        userId,
        used: false,
        coupon: { expiresAt: { gte: now } },
      },
      include: { coupon: true },
      orderBy: { coupon: { expiresAt: "asc" } },
    });

    // 2. EXPIRED
    const expired = await prisma.userCoupon.findMany({
      where: {
        userId,
        used: false,
        coupon: { expiresAt: { lt: now } },
      },
      include: { coupon: true },
      orderBy: { coupon: { expiresAt: "desc" } },
    });

    // 3. USED (ล่างสุด)
    const used = await prisma.userCoupon.findMany({
      where: { userId, used: true },
      include: { coupon: true },
      orderBy: { usedAt: "desc" },
    });

    const all = [
      ...active.map(c => ({ ...c, status: "ACTIVE" })),
      ...expired.map(c => ({ ...c, status: "EXPIRED" })),
      ...used.map(c => ({ ...c, status: "USED" })),
    ];

    const total = all.length;
    const totalPages = Math.ceil(total / pageSize);

    const items = all.slice(skip, skip + pageSize);

    const result = userCoupons.map((uc) => {
      let status: "ACTIVE" | "USED" | "EXPIRED" = "ACTIVE";

      if (uc.used) status = "USED";
      else if (uc.coupon.expiresAt < now) status = "EXPIRED";

      return {
        id: uc.id,
        status, // ⭐ เพิ่มตรงนี้
        used: uc.used,
        assignedAt: uc.assignedAt,
        coupon: {
          id: uc.coupon.id,
          code: uc.coupon.code,
          name: uc.coupon.name,
          description: uc.coupon.description,
          terms: uc.coupon.terms,
          imageUrl: uc.coupon.imageUrl,
          pointCost: uc.coupon.pointCost,
          pointEarn: uc.coupon.pointEarn,
          quantity: uc.coupon.quantity,
          maxPerUser: uc.coupon.maxPerUser,
          expiresAt: uc.coupon.expiresAt,
          campaign: uc.coupon.campaign
            ? { id: uc.coupon.campaign.id, name: uc.coupon.campaign.name }
            : null,
        },
      };
    });

    return NextResponse.json({
      items: items.map(uc => ({
        id: uc.id,
        status: uc.status,
        used: uc.used,
        assignedAt: uc.assignedAt,
        coupon: {
          id: uc.coupon.id,
          name: uc.coupon.name,
          code: uc.coupon.code,
          expiresAt: uc.coupon.expiresAt,
          imageUrl: uc.coupon.imageUrl,
        },
      })),
      page,
      pageSize,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("❌ Error fetching user coupons:", error);
    return NextResponse.json({ error: "Failed to fetch user coupons" }, { status: 500 });
  }
}
