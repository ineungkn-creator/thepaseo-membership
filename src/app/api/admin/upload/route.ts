// app/api/admin/upload/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const folder = process.env.UPLOAD_PATH_POPUP;
  const localRoot = process.env.LOCAL_UPLOAD_ROOT || "public";

  const fileName = `${Date.now()}-${file.name}`;
  const localPath = path.join(process.cwd(), localRoot, folder!, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.mkdirSync(path.dirname(localPath), { recursive: true });
  fs.writeFileSync(localPath, buffer);

  const url = `${process.env.STORAGE_BASE_URL}${folder}/${fileName}`;

  return NextResponse.json({ path: url });
}
