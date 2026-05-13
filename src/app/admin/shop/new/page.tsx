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
    phone: "",
    categoryId: "",
    branchId: "",
    customRate: "",
  });

  const [hours, setHours] = useState([
    { dayOfWeek: 1, openTime: "10:00", closeTime: "20:00", isClosed: false },
    { dayOfWeek: 2, openTime: "10:00", closeTime: "20:00", isClosed: false },
    { dayOfWeek: 3, openTime: "10:00", closeTime: "20:00", isClosed: false },
    { dayOfWeek: 4, openTime: "10:00", closeTime: "20:00", isClosed: false },
    { dayOfWeek: 5, openTime: "10:00", closeTime: "20:00", isClosed: false },
    { dayOfWeek: 6, openTime: "10:00", closeTime: "20:00", isClosed: false },
    { dayOfWeek: 0, openTime: "10:00", closeTime: "20:00", isClosed: false },
  ]);

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
      tags,
      hours,
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
                className="input"
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
                className="file-input"
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
                className="file-input"
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

            <div>
              <label className="block text-sm font-medium text-gray-900">เบอร์โทร</label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            {/* Opening Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                เวลาเปิดทำการ
              </label>
              
              <div className="space-y-3">
              {hours.map((h, i) => {
                const days = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัส","ศุกร์","เสาร์"];

                return (
                  <div key={i} className="w-full flex flex-row items-center md:gap-4 gap-2">

                    <div className="w-24 text-sm">{days[h.dayOfWeek]}</div>

                    <input
                      type="checkbox"
                      checked={!h.isClosed}
                      onChange={(e) => {
                        const newHours = [...hours];
                        newHours[i].isClosed = !e.target.checked;
                        setHours(newHours);
                      }}
                    />

                    {!h.isClosed && (
                      <>
                        <input
                          type="time"
                          className="input_time"
                          value={h.openTime}
                          onChange={(e) => {
                            const newHours = [...hours];
                            newHours[i].openTime = e.target.value;
                            setHours(newHours);
                          }}
                        />

                        <span>-</span>

                        <input
                          type="time"
                          className="input_time"
                          value={h.closeTime}
                          onChange={(e) => {
                            const newHours = [...hours];
                            newHours[i].closeTime = e.target.value;
                            setHours(newHours);
                          }}
                        />
                      </>
                    )}

                    {h.isClosed && (
                      <span className="text-gray-400 text-sm">ปิด</span>
                    )}
                  </div>
                );
              })}
            </div>
            </div>

            {/* Zone */}
            <div>
              <label className="block text-sm font-medium text-gray-900">โซน</label>
              <input
                className="input"
                value={form.zone}
                onChange={(e) => setForm({ ...form, zone: e.target.value })}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-900">ที่ตั้ง</label>
              <input
                className="input"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            {/* Branch */}
            <div>
              <label className="block text-sm font-medium text-gray-900">เลือกสาขา</label>
              <select
                className="input"
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
                className="input"
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
                className="input"
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
