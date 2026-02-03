import { PrismaClient, PointType } from "@prisma/client";
import { sendLineMessage } from "./lineMessage";

const prisma = new PrismaClient();

export async function addPoints(userId: string, amount: number, referenceId?: string, description?: string, type: PointType = PointType.EARN) {
  if (amount <= 0) throw new Error("Amount must be positive");

  let pointBalance = await prisma.pointBalance.findUnique({ where: { userId } });
  if (!pointBalance) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");
    pointBalance = await prisma.pointBalance.create({ data: { userId, balance: user.point || 0 } });
  }

  const newBalance = pointBalance.balance + amount;

  await prisma.$transaction([
    prisma.pointBalance.update({ where: { userId }, data: { balance: newBalance } }),
    prisma.pointTransaction.create({
      data: { userId, type, amount, balanceAfter: newBalance, referenceId, description },
    }),
  ]);

  // ✅ แจ้งเตือนผ่าน LINE Messaging API
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { lineId: true, name: true } });
  if (user?.lineId) {
    await sendLineMessage(
      user.lineId,
      `🎉 คุณได้รับ ${amount} พอยต์\n💬 ${description || "ขอบคุณที่ร่วมกิจกรรมกับเรา!"}\nยอดพอยต์ปัจจุบัน: ${newBalance} พอยต์`
    );
  }

  return newBalance;
}

export async function deductPoints(userId: string, amount: number, referenceId?: string, description?: string, type: PointType = PointType.REDEEM) {
  if (amount <= 0) throw new Error("Amount must be positive");

  let pointBalance = await prisma.pointBalance.findUnique({ where: { userId } });
  if (!pointBalance) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");
    pointBalance = await prisma.pointBalance.create({ data: { userId, balance: user.point || 0 } });
  }

  if (pointBalance.balance < amount) throw new Error("Not enough points");

  const newBalance = pointBalance.balance - amount;

  await prisma.$transaction([
    prisma.pointBalance.update({ where: { userId }, data: { balance: newBalance } }),
    prisma.pointTransaction.create({
      data: { userId, type, amount: -amount, balanceAfter: newBalance, referenceId, description },
    }),
  ]);

  // ✅ แจ้งเตือนผ่าน LINE Messaging API
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { lineId: true, name: true } });
  if (user?.lineId) {
    await sendLineMessage(
      user.lineId,
      `❗️คุณใช้พอยต์ ${amount} พอยต์\n💬 ${description || "การแลกรางวัลสำเร็จ!"}\nยอดพอยต์ปัจจุบัน: ${newBalance} พอยต์`
    );
  }

  return newBalance;
}

/**
 * ดึง point balance ของ user
 */
export async function getPointBalance(userId: string) {
  let pointBalance = await prisma.pointBalance.findUnique({ where: { userId } });

  // fallback: ถ้าไม่มี ให้สร้างจาก user.point
  if (!pointBalance) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");
    pointBalance = await prisma.pointBalance.create({
      data: { userId, balance: user.point || 0 },
    });
  }

  return pointBalance.balance;
}


