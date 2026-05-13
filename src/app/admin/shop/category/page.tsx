'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Loading from '@/components/loading';
import { IoIosAddCircle } from "react-icons/io";

export default function ShopCategoryPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch('/api/admin/shop/category');
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้?')) return;

    await fetch(`/api/admin/shop/category/${id}`, {
      method: 'DELETE',
    });

    fetchCategories();
  };

  const move = async (id: string, direction: "up" | "down") => {
    if (reordering) return;

    setReordering(true);
    await fetch('/api/admin/shop/category/reorder', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, direction }),
    });

    await fetchCategories();
    setReordering(false);
  };

  if (loading) return <Loading />;

  return (
    <div className="bg-white p-4 rounded-lg flex-1 mr-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">หมวดหมู่ร้านค้า</h1>
        <Link
          href="/admin/shop/category/new"
          className="flex items-center gap-2 px-4 py-2 bg-paseo text-white rounded-lg"
        >
          <IoIosAddCircle size={20} />
          เพิ่มหมวดหมู่
        </Link>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2">ลำดับ</th>
              <th className="border px-3 py-2">รูป</th>
              <th className="border px-3 py-2">ชื่อ</th>
              <th className="border px-3 py-2">Slug</th>
              <th className="border px-3 py-2">สี</th> {/* ⭐ เพิ่ม */}
              <th className="border px-3 py-2">จำนวนร้าน</th>
              <th className="border px-3 py-2">จัดการ</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((cat, index) => {
              const isFirst = index === 0;
              const isLast = index === categories.length - 1;

              return (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <div className="flex justify-center gap-1">
                      <button
                        disabled={isFirst || reordering}
                        onClick={() => move(cat.id, "up")}
                        className={`px-2 py-1 rounded ${
                          isFirst ? "bg-gray-100 text-gray-400" : "bg-paseo"
                        }`}
                      >
                        ↑
                      </button>
                      <button
                        disabled={isLast || reordering}
                        onClick={() => move(cat.id, "down")}
                        className={`px-2 py-1 rounded ${
                          isLast ? "bg-gray-100 text-gray-400" : "bg-red-300"
                        }`}
                      >
                        ↓
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {cat.sortOrder}
                    </div>

                    </div>
                  </td>

                  <td className="border px-3 py-2 text-center">
                    {cat.imageUrl ? (
                      <Image
                        src={cat.imageUrl}
                        alt={cat.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 object-cover mx-auto"
                      />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  <td className="border px-3 py-2">
                    <span
                      className="px-2 py-1 rounded text-white text-xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      {cat.name}
                    </span>
                  </td>
                  <td className="border px-3 py-2">{cat.slug}</td>
                  <td className="border px-3 py-2 text-center">
                    {cat.color ? (
                      <div className="flex justify-center items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-xs text-gray-500">{cat.color}</span>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="border px-3 py-2 text-center">
                    {cat.shops.length}
                  </td>

                  <td className="border px-3 py-2 text-center space-x-2">
                    <Link
                      href={`/admin/shop/category/${cat.id}/edit`}
                      className="px-2 py-1 bg-paseo text-white rounded"
                    >
                      แก้ไข
                    </Link>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
