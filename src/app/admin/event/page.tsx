"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { hasPermission, PERMISSIONS } from "@/lib/auth/permissions";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { PiDotsThreeOutlineLight } from "react-icons/pi";
import { LuShare2 } from "react-icons/lu";
import { FaRegCalendarCheck } from "react-icons/fa";
import { CiBitcoin } from "react-icons/ci";
import { FaStar } from "react-icons/fa";

import { IoIosAddCircle } from "react-icons/io";


// สร้าง type สำหรับ Event
type EventData = {
  id: string;
  name: string;
  description: string | null;
  terms: string | null;
  pointCost: number;
  pointEarn: number;
  quantity: number;
  maxPerUser: number;
  startDate: string;
  endDate: string;
  imageUrl: string | null;
  branches: { id: string; name: string }[];
  shops: { id: string; name: string }[];
  registrations: any[];
  redemptions: any[];
  createdAt: string;
  tags?: any[];
};

export default function AdminEventList() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const canEdit =
    role && hasPermission(role, PERMISSIONS.EVENT_EDIT);

  const canDelete =
    role && hasPermission(role, PERMISSIONS.EVENT_DELETE);

  const fetchEvents = async (page: number) => {
    try {
      const res = await fetch(`/api/admin/event?page=${page}`);
      const data = await res.json();
      setEvents(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents(page);
  }, [page]);

  const deleteEvent = async (id: string) => {
    if (!confirm("ยืนยันการลบ Event?")) return;
    try {
      await fetch(`/api/admin/event/${id}`, { method: "DELETE" });
      fetchEvents(page);
      setSelectedEvent(null); // Clear the preview after deletion
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };
  
  const handleSelectEvent = (event: EventData) => {
    setSelectedEvent(event);
  };

  return (
    <div className="flex w-full min-h-screen">
      {/* ส่วนตารางหลัก */}
      <div className="bg-white p-4 rounded-lg flex-1 mr-4">
        <div className="flex flex-row justify-between mb-4">
          <h1 className="text-2xl font-bold">รายการอีเวนท์</h1>
          <Link
            href="/admin/event/create"
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
                <th className="p-2 border">ชื่อ</th>
                <th className="p-2 border">สาขา</th>
                <th className="p-2 border">ร้าน</th>
                <th className="p-2 border">แท็ก</th>
                <th className="p-2 border">เข้าร่วม</th>
                <th className="p-2 border">แลกสำเร็จ</th>
                <th className="p-2 border">วันที่สร้าง</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td
                    className=" border p-2 cursor-pointer text-text-active font-medium hover:underline"
                    onClick={() => handleSelectEvent(r)}
                  >
                    {r.name}
                  </td>
                  <td className="p-2 border">
                    {r.branches?.map((b) => (
                      <Badge key={b.id} className="text-white mr-2">{b.name}</Badge>
                    ))}
                  </td>
                  <td className="p-2 border">
                    {r.shops?.map((s) => (
                      <Badge key={s.id} className="text-white mr-2">{s.name}</Badge>
                    ))}
                  </td>
                  <td className="p-2 border">
                  {r.tags && r.tags.length > 0 ? (
                    r.tags.map(tag => (
                      <span key={tag.id} className="px-2 py-1 text-xs bg-paseo-hover text-black rounded-full mr-1">{tag.name}</span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                  <td
                    className="p-2 border cursor-pointer text-text-active text-center"
                    onClick={() => router.push(`/admin/event/${r.id}/registrations`)}
                  >
                    {r.registrations?.length || 0}
                  </td>
                  <td className="p-2 border text-center">{r.redemptions?.length || 0}</td>
                  <td className="p-2 border">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="p-2 flex gap-2 justify-center">
                    {canEdit && (
                      <button
                        onClick={() => router.push(`/admin/event/${r.id}/edit`)}
                        className="text-white px-3 py-1 rounded-lg bg-paseo"
                      >
                        แก้ไข
                      </button>
                    )}

                    {canDelete && (
                      <button onClick={() => deleteEvent(r.id)} className="text-white px-3 py-1 rounded-lg bg-red-500">
                        ลบ
                      </button>
                    )}
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
              className={`px-4 py-1 border rounded-lg ${p === page ? "bg-paseo text-white" : ""}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      
      {/* ส่วน Preview Panel */}
      {selectedEvent && (
        <div className="flex-1 sticky top-4 self-start bg-white rounded-xl shadow-lg border border-gray-200 p-6 ml-4">
          <h2 className="text-xl font-bold mb-4">พรีวิว</h2>
            <div className="space-y-4">
            
            {/* Image & Header */}
            <div className="relative">
              {/* Image */}
              <div className="w-full bg-gray-200 mb-4">
                {selectedEvent.imageUrl ? (
                  <Image
                    src={selectedEvent.imageUrl}
                    alt={selectedEvent.name}
                    width={800}
                    height={600}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-500">
                    ไม่มีรูปภาพ
                  </div>
                )}
              </div>
              
               <div className="flex flex-row justify-between align-start mb-4 gap-4">
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-bold">{selectedEvent.name || "ชื่อ Event"}</h3>

              <div className="flex flex-row item-center align-center gap-4">
                <FaRegCalendarCheck className="text-2xl" />
                <p className="text-base text-gray-500">
                  ตั้งแต่ {selectedEvent.startDate ? new Date(selectedEvent.startDate).toLocaleString() : "-"} - {selectedEvent.endDate ? new Date(selectedEvent.endDate).toLocaleString() : "-"} นี้
                </p>
              </div>

              <div className="flex flex-row item-center align-center gap-4">
                <CiBitcoin className="text-2xl" />
                <p className="text-base text-gray-600">ค่าใช้จ่าย: {selectedEvent.pointCost} พอยต์</p>
              </div>

              <div className="flex flex-row item-center align-center gap-4">
                <CiBitcoin className="text-2xl" />
                <p className="text-base text-gray-600">ผู้เข้าร่วม: {selectedEvent.quantity || 0} | จำกัดต่อผู้ใช้: {selectedEvent.maxPerUser || 1} คน</p>
              </div>

              <div className="flex flex-row item-center align-center gap-4">
                <CiBitcoin className="text-2xl" />
                <p className="text-base text-gray-600">ผู้เข้าร่วมจะได้รับ: {selectedEvent.pointEarn} พอยต์</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 pr-4">
                <FaStar className="text-2xl" />
                <PiDotsThreeOutlineLight className="text-2xl" />
                <LuShare2 className="text-2xl" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">รายละเอียด</h3>
              <p className="text-base mb-2">{selectedEvent.description || "รายละเอียด..."}</p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">เงื่อนไขกิจกรรม</h3>
              <p className="text-base mb-2">{selectedEvent.terms || "เงื่อนไข..."}</p>
            </div>

              {/* Other details */}
              <div className="text-xs text-gray-500 space-y-1">
                <p><span className="font-semibold">ผู้เข้าร่วม:</span> {selectedEvent.quantity > 0 ? `${selectedEvent.quantity} คน` : "ไม่จำกัด"}</p>
                <p><span className="font-semibold">จำกัดต่อผู้ใช้:</span> {selectedEvent.maxPerUser > 0 ? `${selectedEvent.maxPerUser} ครั้ง` : "ไม่จำกัด"}</p>
                {selectedEvent.pointEarn > 0 && <p><span className="font-semibold">ได้รับแต้ม:</span> {selectedEvent.pointEarn} พอยต์</p>}
              </div>

              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  <span className="font-semibold">ร้านค้า:</span>{" "}
                  {selectedEvent.shops.length > 0
                    ? selectedEvent.shops.map((s) => s.name).join(", ")
                    : "ยังไม่ได้เลือก"}
                </p>
                <p>
                  <span className="font-semibold">สาขา:</span>{" "}
                  {selectedEvent.branches.length > 0
                    ? selectedEvent.branches.map((b) => b.name).join(", ")
                    : "ยังไม่ได้เลือก"}
                </p>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}