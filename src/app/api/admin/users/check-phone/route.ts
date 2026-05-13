// api/users/check-phone/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ error: "Missing phone" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { phone },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json(
      { error: "เบอร์นี้ถูกใช้งานแล้ว" },
      { status: 400 }
    );
  }

  return NextResponse.json({ available: true });
}