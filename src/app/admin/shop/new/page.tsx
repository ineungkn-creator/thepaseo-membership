"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import BackButton from "@/components/BackButton/page";
import RichTextEditor from "@/components/RichTextEditor/page";
import TagSelector from "@/components/TagSelector";

export default function NewShopPage() {
  const router = useRouter();

  const [branches, setBranches] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    logoUrl: "",
    imageUrl: "",
    description: "",
    zone: "",
    location: "",
    categoryId: "",
    branchId: "",
    customRate: "",
  });

  // ⭐ Tag state
  const [tags, setTags] = useState<string[]>([]);

  // Load dropdown data
  useEffect(() => {
    const fetchData = async () => {
      const branchRes = await fetch("/api/admin/branches");
      const categoryRes = await fetch("/api/admin/shop/category");
      setBranches(await branchRes.json());
      setCategories(await categoryRes.json());
    };
    fetchData();
  }, []);

  const handleUpload = async (file: File, field: "logoUrl" | "imageUrl") => {
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);

    try {
      const res = await fetch("/api/admin/shop/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.path) {
        setForm((prev) => ({ ...prev, [field]: data.path }));
      }
    } finally {
      setUploading(false);
    }
  };

  // Submit new shop + tags
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...form,
      tags, // ⭐ ส่งแท็กไปพร้อมกัน
    };

    const res = await fetch("/api/admin/shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const shop = await res.json();

    // redirect ไปหน้า edit หลังสร้างเสร็จ
    router.push(`/admin/shop/${shop.id}/edit`);
  };

  return (
    <div>
      <BackButton className="mb-4" />

      <Card className="bg-white">
        <CardContent className="md:p-10 p-4 space-y-4">
          <h1 className="text-xl font-bold mb-4">เพิ่มร้านค้า</h1>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900">ชื่อร้าน</label>
              <input
                className="w-full border p-2 rounded-lg"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-900">โลโก้ร้าน</label>
              <input
                type="file"
                accept="image/*"
                className="w-full border p-2 rounded-lg"
                onChange={(e) =>
                  e.target.files?.[0] && handleUpload(e.target.files[0], "logoUrl")
                }
              />
              {uploading && <p className="text-gray-500">กำลังอัพโหลด...</p>}
              {form.logoUrl && (
                <Image
                  width={600}
                  height={600}
                  src={form.logoUrl}
                  alt="logo preview"
                  className="mt-2 w-24 h-24 object-cover rounded-lg"
                />
              )}
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-900">ภาพร้าน</label>
              <input
                type="file"
                accept="image/*"
                className="w-full border p-2 rounded-lg"
                onChange={(e) =>
                  e.target.files?.[0] && handleUpload(e.target.files[0], "imageUrl")
                }
              />
              {form.imageUrl && (
                <Image
                  width={600}
                  height={600}
                  src={form.imageUrl}
                  alt="image preview"
                  className="mt-2 w-32 h-32 object-cover rounded-lg"
                />
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-900">รายละเอียด</label>
              <RichTextEditor
                value={form.description}
                onChange={(value: string) => setForm({ ...form, description: value })}
              />
            </div>

            {/* Zone */}
            <div>
              <label className="block text-sm font-medium text-gray-900">โซน</label>
              <input
                className="w-full border p-2 rounded-lg"
                value={form.zone}
                onChange={(e) => setForm({ ...form, zone: e.target.value })}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-900">ที่ตั้ง</label>
              <input
                className="w-full border p-2 rounded-lg"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            {/* Branch */}
            <div>
              <label className="block text-sm font-medium text-gray-900">เลือกสาขา</label>
              <select
                className="w-full border p-2 rounded-lg"
                value={form.branchId}
                onChange={(e) => setForm({ ...form, branchId: e.target.value })}
              >
                <option value="">เลือกสาขา</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-900">หมวดหมู่</label>
              <select
                className="w-full border p-2 rounded-lg"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">เลือกหมวดหมู่</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ⭐ Tag Selector */}
            <TagSelector value={tags} onChange={setTags} />

            {/* Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-900">Rate Point</label>
              <input
                className="w-full border p-2 rounded-lg"
                value={form.customRate}
                onChange={(e) => setForm({ ...form, customRate: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-paseo text-white py-2 rounded-lg"
            >
              บันทึกร้านค้า
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
