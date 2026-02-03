import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  getUploadFolder,
  getLocalPath,
  ensureDir,
  makePublicUrl,
} from "@/lib/storage";
import fs from "fs";

const prisma = new PrismaClient();

// ✅ GET: ดึง events ทั้งหมด
export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = 10;

  const totalItems = await prisma.event.count();

  const events = await prisma.event.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: "desc" },
    include: {
      branches: true,
      shops: true,
      registrations: true,
    },
  });

  // ดึง tagRelations ของ event ทั้งหน้า (Batch Query ป้องกัน N+1)
  const eventIds = events.map((e) => e.id);

  const tagRows = await prisma.tagRelation.findMany({
    where: {
      targetId: { in: eventIds },
      targetType: "event",
    },
    include: { tag: true },
  });

  // group tags ตาม eventIds
  const tagsByEvent: Record<string, any[]> = {};
  for (const row of tagRows) {
    if (!tagsByEvent[row.targetId]) tagsByEvent[row.targetId] = [];
    tagsByEvent[row.targetId].push(row.tag);
  }

  // รวม tags เข้า event
  const eventsWithTags = events.map((e) => ({
    ...e,
    tags: tagsByEvent[e.id] || [],
  }));

  const totalPages = Math.ceil(totalItems / pageSize);

  return NextResponse.json({
    data: eventsWithTags,
    pagination: { page, totalPages, totalItems },
  });
}

// ✅ POST: สร้าง event ใหม่
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const startDateRaw = formData.get("startDate")?.toString() || null;
    const endDateRaw = formData.get("endDate")?.toString() || null;

    // ข้อมูล text
    const name = formData.get("name")?.toString() || "";
    const linkShare = formData.get("linkShare")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const terms = formData.get("terms")?.toString() || "";
    const pointCost = parseInt(formData.get("pointCost")?.toString() || "0");
    const pointEarn = parseInt(formData.get("pointEarn")?.toString() || "0");
    const quantity = parseInt(formData.get("quantity")?.toString() || "0");
    const maxPerUser = parseInt(formData.get("maxPerUser")?.toString() || "1");

    const startDate = startDateRaw ? new Date(startDateRaw) : new Date();
    const endDate = endDateRaw ? new Date(endDateRaw) : new Date();

    // multi-select
    const shopIds = formData.getAll("shopIds[]") as string[];
    const branchIds = formData.getAll("branchIds[]") as string[];

    // Handle file upload
    const file = formData.get("file") as File;
    let imageUrl: string | null = null;

    if (file && file.size > 0) {
      const folder = getUploadFolder("event");
      const filename = `${Date.now()}-${file.name}`;

      const localPath = getLocalPath(folder, filename);
      ensureDir(localPath);

      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(localPath, buffer);

      imageUrl = makePublicUrl(folder, filename);
    }

    const tagsRaw = formData.get("tags")?.toString() || "[]";
    const tags: string[] = JSON.parse(tagsRaw);

    // สร้าง event พร้อมเชื่อม branches และ shops
    const event = await prisma.event.create({
      data: {
        name,
        linkShare,
        description,
        terms,
        pointCost,
        pointEarn,
        quantity,
        maxPerUser,
        startDate,
        endDate,
        imageUrl,
        shops: { connect: shopIds.map((id) => ({ id })) },
        branches: { connect: branchIds.map((id) => ({ id })) },
      },
      include: {
        shops: true,
        branches: true,
      },
    });

    if (tags.length > 0) {
      await prisma.tagRelation.createMany({
        data: tags.map((tagId) => ({
          tagId,
          targetId: event.id,
          targetType: "event",
        })),
      });
    }

    return NextResponse.json(event);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}