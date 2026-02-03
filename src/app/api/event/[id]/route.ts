import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";

const prisma = new PrismaClient();

/* ============================================================
   ✅ GET /api/event/[id]
   ดูรายละเอียด event + สถานะของ user (NO SIDE EFFECT)
============================================================ */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);
    const userId = session?.user?.id || null;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        registrations: userId
          ? { where: { userId } }
          : false,
        _count: { select: { registrations: true } },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isJoined = userId
      ? event.registrations.length > 0
      : false;

    return NextResponse.json({
      id: event.id,
      name: event.name,
      description: event.description,
      terms: event.terms,
      imageUrl: event.imageUrl,
      pointCost: event.pointCost ?? 0,
      pointEarn: event.pointEarn ?? 0,
      quantity: event.quantity,
      maxPerUser: event.maxPerUser,
      startDate: event.startDate,
      endDate: event.endDate,
      joinedCount: event._count.registrations,
      isJoined,
    });
  } catch (error) {
    console.error("❌ GET /api/event/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ============================================================
   ❌ POST /api/event/[id]
   ปิดการใช้งาน (ต้องใช้ /join เท่านั้น)
============================================================ */
export async function POST() {
  return NextResponse.json(
    {
      error: "Method Not Allowed. Please use POST /api/event/[id]/join",
    },
    { status: 405 }
  );
}
