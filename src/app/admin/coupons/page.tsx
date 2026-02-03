"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

import { IoIosAddCircle } from "react-icons/io";

type Coupon = {
  id: string;
  code: string;
  name: string;
  description?: string;
  terms?: string;
  imageUrl?: string;
  pointCost?: number;
  pointEarn?: number;
  quantity?: number;
  maxPerUser?: number;
  startDate:  string;
  endDate:  string;
  expiresAt: string;
  autoAssign: boolean;
  createdAt: string;
  campaign?: { id: string; name: string } | null;
  users: { id: string }[];
  isRedemption: string;
  branches: { id: string; name: string }[];
  shops: { id: string; name: string }[];
  tags?: any[];
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const fetchCoupons = async (page: number) => {
    try {
      const res = await fetch(`/api/admin/coupons?page=${page}`);
      if (!res.ok) throw new Error("Failed to load coupons");
      const data = await res.json();
      setCoupons(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching coupons:", err);
    }
  };

  useEffect(() => {
    fetchCoupons(page);
  }, [page]);

  const deleteCoupon = async (id: string) => {
    if (!confirm("ยืนยันการลบ Coupon นี้?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    fetchCoupons(page);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex flex-row justify-between mb-4">
        <h1 className="text-2xl font-bold">รายการคูปอง</h1>
        <Link
          href="/admin/coupons/create"
          className="flex flex-row items-center gap-2 px-4 py-2 bg-paseo text-white rounded-lg"
          >
        <IoIosAddCircle size={20} />
        เพิ่ม
        </Link>
      </div>

      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100 whitespace-nowrap">
              <th className="p-2 border">คูปอง</th>
              <th className="p-2 border">ชื่อ</th>
              <th className="p-2 border">สาขา</th>
              <th className="p-2 border">ร้าน</th>
              <th className="p-2 border">แท็ก</th>
              <th className="p-2 border">พอยท์</th>
              <th className="p-2 border">จำนวน</th>
              <th className="p-2 border">เริ่ม</th>
              <th className="p-2 border">ถึง</th>
              <th className="p-2 border">หมดอายุ</th>
              <th className="p-2 border">เข้าร่วม</th>
              <th className="p-2 border">คงเหลือ</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-2 border">{c.code}</td>
                <td className="p-2 flex flex-col items-start">
                  {c.name}
                  {c.campaign ? (
                    <Badge className="text-white mr-2 text-xs">{c.campaign.name}</Badge>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                <td className="p-2 border">
                  <div className="flex flex-col items-start gap-1">
                  {c.branches?.map((b) => (
                    <Badge className="text-white mr-2 whitespace-nowrap" key={b.id}>{b.name}</Badge>
                  ))}
                  </div>
                </td>
                <td className="p-2 border">
                  {c.isRedemption ? (
                    <Badge className="bg-paseo-dark text-white mr-2 whitespace-nowrap">
                      จุดบริการ
                    </Badge>
                  ) : c.shops?.length > 0 ? (
                    c.shops.map((s) => (
                      <Badge className="text-white mr-2" key={s.id}>
                        {s.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </td>
                <td className="p-2 border">
                  {c.tags && c.tags.length > 0 ? (
                    c.tags.map(tag => (
                      <span key={tag.id} className="px-2 py-1 text-xs bg-paseo-hover text-black rounded-full mr-1">{tag.name}</span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                <td className="p-2 border text-start whitespace-nowrap">
                  ได้รับ: {c.pointEarn ?? 0}<br />ใช้: {c.pointCost ?? 0}
                </td>
                <td className="p-2 border text-center">
                  {c.users?.length ? (
                    <button
                      onClick={() => router.push(`/admin/coupons/${c.id}/users`)}
                      className="text-paseo underline hover:text-paseo-dark"
                    >
                      {c.users.length}
                    </button>
                  ) : (
                    0
                  )}
                </td>
                <td className="p-2 border">
                  {new Date(c.startDate).toLocaleDateString()}
                </td>
                <td className="p-2 border text-center">
                  {new Date(c.endDate).toLocaleDateString()}
                </td>
                <td className="p-2 border text-center">
                  {new Date(c.expiresAt).toLocaleDateString()}
                </td>
                <td className="p-2 border text-center">{c.users?.length || 0}</td>
                <td className="p-2 border text-center">{c.quantity ?? "-"}</td>
                <td className="p-2 flex gap-2 justify-center">
                  <button
                    onClick={() => router.push(`/admin/coupons/${c.id}/edit`)}
                    className="px-3 py-1 rounded-lg text-white bg-paseo"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => deleteCoupon(c.id)}
                    className="px-3 py-1 rounded-lg text-white bg-red-500"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex gap-2 mt-4 justify-center">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-1 border rounded-lg ${
              p === page ? "bg-paseo text-white" : ""
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
