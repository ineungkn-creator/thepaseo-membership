"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import BackButton from '@/components/BackButton/page';

export default function BannerUploadNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = async () => {
    if (!title || !imageFile) {
      alert("กรุณากรอกชื่อและอัพโหลดรูป");
      return;
    }

    // Upload image
    const formData = new FormData();
    formData.append("file", imageFile);

    const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const { path: imageUrl } = await uploadRes.json();

    const res = await fetch("/api/admin/bannerupload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        linkUrl,
        imageUrl,
        isActive,
        startDate: startDate || null,
        endDate: endDate || null,
      }),
    });

    if (res.ok) router.push("/admin/bannerupload");
    else alert("เกิดข้อผิดพลาด");
  };

  return (
    <div>
      <div>
        <BackButton className="mb-4" />
      </div>
      <Card className="bg-white">
        <CardContent className="md:p-10 p-4 space-y-4">
          <h1 className="text-2xl font-bold">เพิ่ม bannerupload ใหม่</h1>

          
          <div className="sm:col-span-3">
            <label className="block text-sm/6 font-medium text-gray-900">ชื่อ Banner</label>
            <div className="mt-2">
              <Input className="input" placeholder="ชื่อ" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm/6 font-medium text-gray-900">ลิงก์เมื่อกด</label>
            <div className="mt-2">
            <Input className="input" placeholder="ลิงก์เมื่อกด" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
            </div>
          </div>


          <div className="sm:col-span-3">
            <label className="block text-sm/6 font-medium text-gray-900">รูปภาพ</label>
            <input className="file-input" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
          </div>

          <div className="sm:col-span-3 flex flex-row gap-4">
            <div className="w-full">
              <label className="block text-sm/6 font-medium text-gray-900">เริ่มวันที่</label>
              <Input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="w-full">
              <label className="block text-sm/6 font-medium text-gray-900">สิ้นสุดวันที่</label>
              <Input className="input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="sm:col-span-3 flex flex-row gap-4">
            <Checkbox checked={isActive} onCheckedChange={(val) => setIsActive(!!val)} />
            <label className="block text-sm/6 font-medium text-gray-900">เปิดใช้งาน</label>
          </div>

          <Button className="bg-paseo" onClick={handleSubmit}>บันทึก bannerupload</Button>
        </CardContent>
      </Card>
    </div>
  );
}
