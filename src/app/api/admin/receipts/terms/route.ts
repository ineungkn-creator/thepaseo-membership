import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Fetch the UploadTerm (assuming single record)
export async function GET() {
  const term = await prisma.uploadTerm.findFirst();

  return NextResponse.json({
    id: term?.id ?? "",
    description: term?.description ?? "",
    images: term?.images ? JSON.parse(term.images) : [],
  });
}


// PUT: Update the UploadTerm
export async function PUT(req: Request) {
  const { id, description, images } = await req.json();

  const data: any = {};
  if (description !== undefined) data.description = description;
  if (images !== undefined) data.images = JSON.stringify(images);

  const term = id
    ? await prisma.uploadTerm.update({ where: { id }, data })
    : await prisma.uploadTerm.create({ data });

  return NextResponse.json(term);
}
