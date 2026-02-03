//api/receipt/upload/routs.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authConfig } from "@/lib/auth.config";
import { writeFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const files = formData.getAll("images") as File[];

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }

  const savedReceipts = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name).toLowerCase();
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(process.cwd(), "public/uploads", fileName);
    await writeFile(filePath, buffer);

    const STORAGE_BASE_URL = process.env.STORAGE_BASE_URL || "";
    const STORAGE_UPLOAD_PATH = process.env.STORAGE_UPLOAD_PATH || "/uploads";

    const fileUrl = `${STORAGE_BASE_URL}${STORAGE_UPLOAD_PATH}/${fileName}`;
    const mime = file.type?.toLowerCase() || "";

    let fileType = "PDF";
    if (mime.startsWith("image/")) {
      fileType = "IMAGE";
    }

    const receipt = await prisma.receipt.create({
      data: {
        userId: session.user.id,
        fileUrl,
        fileType,
        amount: 0,
        branchId: null,
      },
    });

    savedReceipts.push(receipt);
  }

  return NextResponse.json({ success: true, receipts: savedReceipts });
}