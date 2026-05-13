import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      interests: true,
      branch: true,
      pointBalance: true,
      pointTxns: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(user);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  const session = await getServerSession(authConfig);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const {
    name,
    phone,
    email,
    branchId,
    gender,
    interests,

    address,
    subDistrict,
    district,
    province,
    postalCode,
    occupation,
    residenceType,

  } = body;

  const user = await prisma.user.update({
    where: { id },
    data: {
      name,
      phone,
      email,
      branchId,
      gender,

      address,
      subDistrict,
      district,
      province,
      postalCode,
      occupation,
      residenceType,

      interests: interests
        ? {
            set: [],
            connect: interests.map((id: string) => ({ id })),
          }
        : undefined,
    },
  });

  return NextResponse.json({ success: true, user });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  const { id } = await params;

  await prisma.user.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}