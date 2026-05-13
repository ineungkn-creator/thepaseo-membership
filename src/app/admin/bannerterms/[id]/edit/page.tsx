"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import BackButton from '@/components/BackButton/page';

export default function BannerTermsEditPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetch(`/api/admin/bannerterms/${id}`)
      .then(res => res.json())
      .then(data => {
        setTitle(data.title);
        setLinkUrl(data.linkUrl);
        setImageUrl(data.imageUrl);
        setIsActive(data.isActive);
        setStartDate(data.startDate?.split("T")[0] || "");
        setEndDate(data.endDate?.split("T")[0] || "");
      });
  }, [id]);

  const handleSubmit = async () => {
    let finalImageUrl = imageUrl;

    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const result = await uploadRes.json();
      finalImageUrl = result.path;
    }

    const res = await fetch(`/api/admin/bannerterms/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        linkUrl,
        imageUrl: finalImageUrl,
        isActive,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
      }),
    });

    if (res.ok) router.push("/admin/bannerterms");
    else alert("เกิดข้อผิดพลาด");
  };

  return (
    <div>
      <div>
        <BackButton className="mb-4" />
      </div>
      <Card className="bg-white">
        <CardContent className="md:p-10 p-4 space-y-4">
          <h1 className="text-2xl font-bold">แก้ไข Banner</h1>

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
            <label className="block text-sm/6 font-medium text-gray-900">รูปภาพปัจจุบัน:</label>
            {imageUrl &&
              <Image
                width={600}
                height={600}
                src={imageUrl}
                alt="bannerterms"
                className="w-32 h-32 object-cover mb-2 rounded"
              />}
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

          <Button className="bg-paseo" onClick={handleSubmit}>บันทึก bannerterms</Button>
        </CardContent>
      </Card>
    </div>
  );
}