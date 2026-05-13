"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NewBranchPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/shop/upload", { method: "POST", body: formData });
    const data = await res.json();
    setImageUrl(data.path);
    setUploading(false);
  };

  const handleSubmit = async () => {
    const res = await fetch("/api/admin/branch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, location, imageUrl }),
    });
    if (res.ok) router.push("/admin/branch");
    else alert("ไม่สามารถบันทึกได้");
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">เพิ่มสาขาใหม่</h1>

      <div className="space-y-4">
        <div>
          <label>ชื่อสาขา</label>
          <Input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อสาขา" />
        </div>

        <div>
          <label>Slug</label>
          <Input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="ชื่อภาษาอังกฤษ" />
        </div>

        <div>
          <label>ที่ตั้ง</label>
          <Input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="เช่น ถ.สุขุมวิท" />
        </div>

        <div>
          <label>รูปภาพ</label>
          <Input className="file-input" type="file" accept="image/*" onChange={handleUpload} />
          {uploading && <p className="text-sm text-gray-500">กำลังอัปโหลด...</p>}
          {imageUrl &&
            <Image
              width={600}
              height={600}
              src={imageUrl}
              alt="preview"
              className="w-32 h-32 object-cover mt-2 rounded"
            />
          }
        </div>

        <Button onClick={handleSubmit} className="w-full">บันทึก</Button>
      </div>
    </div>
  );
}
