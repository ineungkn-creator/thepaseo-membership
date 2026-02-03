import { NextResponse } from "next/server";
import {
  getUploadFolder,
  getLocalPath,
  ensureDir,
  makePublicUrl,
} from "@/lib/storage";
import fs from "fs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const folder = getUploadFolder("branches");
    const fileName = `${Date.now()}-${file.name}`;
    
    
    const localPath = getLocalPath(folder, fileName);
    ensureDir(localPath);
    
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(localPath, buffer);

    const publicUrl = makePublicUrl(folder, fileName);

    return NextResponse.json({ path: publicUrl });
  } catch (e: any) {
    console.error("❌ Upload branches error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
