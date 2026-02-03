import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reward = await prisma.reward.findUnique({
      where: { id },
      include: { participations: true },
    });

    if (!reward) return NextResponse.json({ error: "Reward not found" }, { status: 404 });

    // เช็คเวลาหมดอายุ
    if (reward.endDate && new Date(reward.endDate) < new Date()) {
      return NextResponse.json({ error: "กิจกรรมหมดเวลาแล้ว" }, { status: 400 });
    }

    // เช็ค maxParticipants
    if (reward.quantity && reward.participations.length >= reward.quantity) {
      return NextResponse.json({ error: "กิจกรรมเต็มแล้ว" }, { status: 400 });
    }

    // เช็คว่าผู้ใช้เข้าร่วมแล้วหรือยัง
    const exists = await prisma.rewardParticipation.findFirst({
      where: {
        rewardId: reward.id,
        userId: session.user.id,
      },
    });
    if (exists) {
      return NextResponse.json({ error: "คุณได้เข้าร่วมกิจกรรมนี้แล้ว" }, { status: 400 });
    }

    // ✅ สร้างการเข้าร่วม
    const participation = await prisma.rewardParticipation.create({
      data: {
        rewardId: reward.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: "เข้าร่วมสำเร็จ", participation });
  } catch (error) {
    console.error("Join error:", error);
    return NextResponse.json({ error: "Failed to join" }, { status: 500 });
  }
}
