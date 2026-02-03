// lib/getProfile.ts
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getProfile() {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) return null;

    // ✅ include branch object เพื่อดึงชื่อสาขา
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        dateOfBirth: true,
        gender: true,
        occupation: true,
        branchId: true,
        branch: {
          select: {
            name: true,   // ⬅ ดึงชื่อสาขา
          }
        },
        residenceType: true,
        district: true,
        province: true,
        address: true,
        //houseNumber: true,
        //alley: true,
        subDistrict: true,
        postalCode: true,
        avatar: true,
        point: true,
        totalSpending: true,
        referralCode: true,
        referredBy: true,
        role: true,
      },
    });

    if (!user) return null;

    // ⭐ เติม branch ให้ตรง type ที่หน้า NewHomePage ต้องการ
    const formattedUser = {
      ...user,
      branch: user.branch?.name ?? null,
    };

    return formattedUser;
  } catch (err) {
    console.error("❌ getProfile() error:", err);
    return null;
  }
}
