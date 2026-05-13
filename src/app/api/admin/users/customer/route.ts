import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

const users = await prisma.user.findMany({
  where: {
    role: "USER",
    ...(search && {
      OR: [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } }
      ],
    }),
  },
  orderBy: { createdAt: "desc" },
  select: {
    id: true,
    name: true,
    phone: true,
    email: true,
    branch: true,
    referralCode: true,
  },
});

  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session || !["ADMIN", "CRMMANAGEMENT"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();

  const {
    name,
    phone,
    email,
    branchId,
    gender,
    dateOfBirth,
    interests,

    occupation,
    residenceType,
    address,
    subDistrict,
    district,
    province,
    postalCode,

  } = body;

  if (!phone || !branchId) {
    return NextResponse.json({ error: "phone and branch required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { phone },
  });

  if (existing) {
    return NextResponse.json({ error: "Phone already used" }, { status: 400 });
  }

  const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const user = await prisma.user.create({
    data: {
      name,
      phone,
      email,
      role: "USER",
      branchId,
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,

      occupation,
      residenceType,
      address,
      subDistrict,
      district,
      province,
      postalCode,

      referralCode,
      interests: interests?.length
        ? {
            connect: interests.map((id: string) => ({ id })),
          }
        : undefined,
    },
  });

  return NextResponse.json({ success: true, user });
}