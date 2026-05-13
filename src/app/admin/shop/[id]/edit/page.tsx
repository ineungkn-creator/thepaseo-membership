'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import BackButton from '@/components/BackButton/page';
import Loading from '@/components/loading';
import RichTextEditor from "@/components/RichTextEditor/page";
import TagSelector from "@/components/TagSelector";

import { IoIosAddCircle } from "react-icons/io";

export default function EditShopPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [hours, setHours] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: '',
    logoUrl: '',
    imageUrl: '',
    description: '',
    phone: '',
    zone: '',
    location: '',
    categoryId: '',
    branchId: '',
    customRate: '' as string | number,
  });

  // โหลดข้อมูลร้าน + branch/category
  useEffect(() => {
    const fetchData = async () => {
      try {
        const shopRes = await fetch(`/api/admin/shop/${id}`);
        const shop = await shopRes.json();

        const branchRes = await fetch('/api/admin/branches');
        const categoryRes = await fetch('/api/admin/shop/category');

        setBranches(await branchRes.json());
        setCategories(await categoryRes.json());

        setForm({
          name: shop.name || '',
          logoUrl: shop.logoUrl || '',
          imageUrl: shop.imageUrl || '',
          description: shop.description || '',
          phone: shop.phone || '',
          zone: shop.zone || '',
          location: shop.location || '',
          categoryId: shop.categoryId || '',
          branchId: shop.branchId || '',
          customRate: shop.customRate ?? '',
        });

        setTags(shop.tags?.map((t: any) => t.id) || []);
        
        const defaultHours = [
          { dayOfWeek: 1, openTime: "10:00", closeTime: "20:00", isClosed: false },
          { dayOfWeek: 2, openTime: "10:00", closeTime: "20:00", isClosed: false },
          { dayOfWeek: 3, openTime: "10:00", closeTime: "20:00", isClosed: false },
          { dayOfWeek: 4, openTime: "10:00", closeTime: "20:00", isClosed: false },
          { dayOfWeek: 5, openTime: "10:00", closeTime: "20:00", isClosed: false },
          { dayOfWeek: 6, openTime: "10:00", closeTime: "20:00", isClosed: false },
          { dayOfWeek: 0, openTime: "10:00", closeTime: "20:00", isClosed: false },
        ];

        setHours(
          shop.hours && shop.hours.length > 0
            ? shop.hours
            : defaultHours
        );

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleUpload = async (file: File, field: 'logoUrl' | 'imageUrl') => {
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const res = await fetch('/api/admin/shop/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.path) {
        setForm((prev) => ({ ...prev, [field]: data.path }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      tags,
      hours
    };

    await fetch(`/api/admin/shop/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    router.push('/admin/shop');
  };

  return (
    <div>
          <div>
            <BackButton className="mb-4" />
          </div>

          <Card className="bg-white">
            <CardContent className="md:p-10 p-4 space-y-4">
            <h1 className="text-xl font-bold mb-4">แก้ไขร้านค้า</h1>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="sm:col-span-3">
                <label className="block text-sm/6 font-medium text-gray-900">ชื่อร้าน</label>
                <div className="mt-2">
                  <input
                    className="input"
                    placeholder="ชื่อร้าน"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Upload Logo */}
              <div className="sm:col-span-3">
                <label className="block text-sm/6 font-medium text-gray-900">โลโก้ร้าน</label>
                <div className="mt-2">
                  <input
                    className="file-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files?.[0] && handleUpload(e.target.files[0], 'logoUrl')
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
              </div>

              {/* Upload Image */}
              <div className="sm:col-span-3">
                <label className="block text-sm/6 font-medium text-gray-900">ภาพร้าน</label>
                <div className="mt-2">
                  <input
                    className="file-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files?.[0] && handleUpload(e.target.files[0], 'imageUrl')
                    }
                  />
                  {uploading && <p className="text-gray-500">กำลังอัพโหลด...</p>}
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
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm/6 font-medium text-gray-900">รายละเอียด</label>
                <div className="mt-2">
                  <RichTextEditor
                    value={form.description}
                    onChange={(value: string) => {
                      setForm({ ...form, description: value });
                    }}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm/6 font-medium text-gray-900">เบอร์โทร</label>
                <div className="mt-2">
                  <input
                    className="input"
                    placeholder="เบอร์โทรร้าน"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
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

              <div className="sm:col-span-3">
                <label className="block text-sm/6 font-medium text-gray-900">โซน</label>
                <div className="mt-2">
                  <input
                    className="input"
                    placeholder="โซน"
                    value={form.zone}
                    onChange={(e) => setForm({ ...form, zone: e.target.value })}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm/6 font-medium text-gray-900">ที่ตั้ง</label>
                <div className="mt-2">
                  <input
                    className="input"
                    placeholder="ที่ตั้ง"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm/6 font-medium text-gray-900">เลือกสาขา</label>
                <div className="mt-2">
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
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm/6 font-medium text-gray-900">ประเภทร้านค้า</label>
                <div className="mt-2">
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
              </div>

              <TagSelector value={tags} onChange={setTags} />

              <div className="sm:col-span-3">
                <label className="block text-sm/6 font-medium text-gray-900">Costom Rate</label>
                <div className="mt-2">
                  <input
                    type="number"
                    className="input"
                    placeholder="อัตราการแลกพอยท์ เช่น 25"
                    value={form.customRate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        customRate: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-paseo text-white py-2 rounded-lg"
              >
                บันทึกการแก้ไข
              </button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
