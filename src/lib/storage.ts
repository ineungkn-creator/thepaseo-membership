// /lib/storage.ts
import fs from "fs";
import path from "path";

export function getUploadFolder(key: string) {
  const envKey = `UPLOAD_PATH_${key.toUpperCase()}`;
  const folder = process.env[envKey];

  if (!folder) throw new Error(`❌ Missing ENV: ${envKey}`);
  return folder; // ex. "/uploads/admin/coupon"
}

export function getLocalPath(folder: string, fileName: string) {
  const root = process.env.STORAGE_LOCAL_ROOT || "public";
  return path.join(process.cwd(), root, folder, fileName);
}

export function ensureDir(pathname: string) {
  const dir = path.dirname(pathname);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function makePublicUrl(folder: string, fileName: string) {
  const base = process.env.STORAGE_BASE_URL || "";
  return `${base}${folder}/${fileName}`;
}
