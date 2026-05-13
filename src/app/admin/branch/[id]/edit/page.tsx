"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EditBranchPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [branch, setBranch] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 🟢 โหลดข้อมูลสาขา
  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const res = await fetch(`/api/admin/branches/${id}`);
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
        const data = await res.json();
        setBranch(data);
      } catch (error) {
        console.error(error);
        alert("ไม่สามารถโหลดข้อมูลสาขาได้");
      }
    };
    if (id) fetchBranch();
  }, [id]);

  // 🟢 อัปโหลดรูปภาพ
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // ✅ ใช้ endpoint ที่ถูกต้อง
      const res = await fetch("/api/admin/branches/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setBranch((prev: any) => ({ ...prev, imageUrl: data.path }));
    } catch (error) {
      console.error(error);
      alert("ไม่สามารถอัปโหลดรูปภาพได้");
    } finally {
      setUploading(false);
    }
  };

  // 🟢 บันทึกข้อมูลสาขา
  const handleSave = async () => {
    if (!branch) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/branches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branch),
      });

      if (!res.ok) throw new Error("ไม่สามารถบันทึกข้อมูลได้");

      router.push("/admin/branch");
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  if (!branch) return <p className="p-4">กำลังโหลด...</p>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">แก้ไขข้อมูลสาขา</h1>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">ชื่อสาขา</label>
          <Input
            value={branch.name}
            onChange={(e) => setBranch({ ...branch, name: e.target.value })}
            placeholder="ชื่อสาขา"
            className="input"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium mb-1">ประเภท</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={branch.type}
            onChange={(e) => setBranch({ ...branch, type: e.target.value })}
          >
            <option value="MALL">MALL</option>
            <option value="PARK">PARK</option>
            <option value="TOWN">TOWN</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-1">ที่ตั้ง</label>
          <Input
            value={branch.location || ""}
            onChange={(e) => setBranch({ ...branch, location: e.target.value })}
            placeholder="เช่น ถ.สุขุมวิท กรุงเทพฯ"
            className="input"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">รูปภาพ</label>
          <Input className="file-input" type="file" accept="image/*" onChange={handleUpload} />
          {uploading && (
            <p className="text-sm text-gray-500 mt-1">กำลังอัปโหลด...</p>
          )}
          {branch.imageUrl && (
            <Image
              width={600}
              height={600}
              src={branch.imageUrl}
              alt="preview"
              className="w-32 h-32 object-cover mt-2 rounded"
            />
          )}
        </div>

        <Button onClick={handleSave} className="w-full" disabled={saving}>
          {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
        </Button>
      </div>
    </div>
  );
}
