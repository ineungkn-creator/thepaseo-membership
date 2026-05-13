import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
  const admins = await prisma.user.findMany({
    where: {
      role: {
        in: ["ADMIN", "ADMINMARKETING", "CRMMANAGEMENT", "STAFF"],
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ admins });
}

export async function POST(req: Request) {
  const body = await req.json();

  const { name, email, password, role } = body;

  const hashed = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role,
      referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    },
  });

  return NextResponse.json({ success: true, admin });
}