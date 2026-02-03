"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BackButton from "@/components/BackButton/page";

type CouponUser = {
  id: string;
  used: boolean;
  assignedAt: string;
  usedAt?: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
};

export default function CouponUsersPage() {
  const { id } = useParams();
  const [users, setUsers] = useState<CouponUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/coupons/${id}/users`)
      .then(res => res.json())
      .then(data => setUsers(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>กำลังโหลด...</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-row mb-4">
            <BackButton />
            <h1 className="text-xl font-bold">
                ผู้ที่ได้รับ / แลกคูปองนี้
            </h1>
        </div>
        

        <div className="overflow-x-auto border rounded-lg shadow-sm">
            <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                <tr>
                    <th className="p-2 border">ชื่อ</th>
                    <th className="p-2 border">อีเมล</th>
                    <th className="p-2 border">เบอร์</th>
                    <th className="p-2 border">สถานะ</th>
                    <th className="p-2 border">วันที่ได้รับ</th>
                </tr>
                </thead>
                <tbody>
                {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{u.user.name}</td>
                    <td className="p-2 border">{u.user.email}</td>
                    <td className="p-2 border">{u.user.phone || "-"}</td>
                    <td className="p-2 border text-center">
                        {u.used ? "ใช้แล้ว" : "ยังไม่ใช้"}
                    </td>
                    <td className="p-2 border">
                        {new Date(u.assignedAt).toLocaleDateString()}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}
