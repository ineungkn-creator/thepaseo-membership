"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BackButton from "@/components/BackButton/page";

type Registration = {
  user: {
    name: string;
    email: string;
    phone?: string
  };
    joinedAt: string;
    redeemed: boolean
  };

export default function EventRegistrations() {
  const params = useParams();
  const { id } = params;
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await fetch(`/api/admin/event/${id}`);
      const data = await res.json();
      setRegistrations(data.registrations || []);
    })();
  }, [id]);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex flex-row mb-4">
          <BackButton />
          <h1 className="text-xl font-bold">
              ผู้เข้าร่วม Event
          </h1>
      </div>

      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">ชื่อ</th>
              <th className="p-2 border">อีเมล</th>
              <th className="p-2 border">เบอร์โทร</th>
              <th className="p-2 border">วันที่เข้าร่วม</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((p, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="p-2 border">{p.user.name}</td>
                <td className="p-2 border">{p.user.email}</td>
                <td className="p-2 border">{p.user.phone || "-"}</td>
                <td className="p-2 border text-center">{new Date(p.joinedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
