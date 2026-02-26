"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { hasPermission, PERMISSIONS } from "@/lib/auth/permissions";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { PiDotsThreeOutlineLight } from "react-icons/pi";
import { LuShare2 } from "react-icons/lu";
import { FaRegCalendarCheck } from "react-icons/fa";
import { CiBitcoin } from "react-icons/ci";
import { FaStar } from "react-icons/fa";

import { IoIosAddCircle } from "react-icons/io";


type RewardData = {
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
  registrations?: any[];
  participations?: any[];
  redemptions: any[];
  createdAt: string;
  isRedemption?: string;
  tags?: any[];
};

export default function AdminRewardList() {
  const [rewards, setRewards] = useState<RewardData[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReward, setSelectedReward] = useState<RewardData | null>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const canEdit =
    role && hasPermission(role, PERMISSIONS.REWARD_EDIT);

  const canDelete =
    role && hasPermission(role, PERMISSIONS.REWARD_DELETE);

  const fetchRewards = async (page: number) => {
    try {
      const res = await fetch(`/api/admin/reward?page=${page}`);
      const data = await res.json();
      setRewards(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRewards(page);
  }, [page]);

  const deleteReward = async (id: string) => {
    if (!confirm("ยืนยันการลบ reward?")) return;
    await fetch(`/api/admin/reward/${id}`, { method: "DELETE" });
    fetchRewards(page);
  };

  const handleSelectReward = (reward: RewardData) => {
    setSelectedReward(reward);
  };

  return (
    <div className="flex w-full min-h-screen">
      {/* ส่วนตารางหลัก */}
      <div className="bg-white p-4 rounded-lg flex-1 mr-4">
        <div className="flex flex-row justify-between mb-4">
          <h1 className="text-2xl font-bold">รายการของรางวัล</h1>
          <Link
            href="/admin/reward/create"
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
              <th className="p-2 border">จำนวน</th>
              <th className="p-2 border">เริ่ม</th>
              <th className="p-2 border">ถึง</th>
              <th className="p-2 border">เข้าร่วม</th>
              <th className="p-2 border">แลกสำเร็จ</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rewards.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td
                  className="p-2 cursor-pointer text-text-active font-medium hover:underline"
                  onClick={() => handleSelectReward(r)}
                >
                  {r.name}
                </td>

                {/* แสดงสาขา */}
                <td className="p-2 border">
                  <div className="flex flex-col items-start gap-1">
                  {r.branches?.length > 0 ? (
                    r.branches.map((b) => (
                      <Badge className="text-white mr-2 whitespace-nowrap" key={b.id}>
                        {b.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                  </div>
                </td>
                

                {/* ✅ แสดงร้านค้าหรือจุดบริการ */}
                <td className="p-2 border">
                  {r.isRedemption ? (
                    <Badge className="bg-paseo-dark text-white mr-2 whitespace-nowrap">
                      จุดบริการ
                    </Badge>
                  ) : r.shops?.length > 0 ? (
                    r.shops.map((s) => (
                      <Badge className="text-white mr-2" key={s.id}>
                        {s.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
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

                <td className="p-2 border text-center">{r.quantity ?? "-"}</td>

                <td className="p-2 border">{new Date(r.startDate).toLocaleDateString()}</td>
                <td className="p-2 border">{new Date(r.endDate).toLocaleDateString()}</td>

                <td
                  className="p-2 border cursor-pointer text-center text-text-active"
                  onClick={() => router.push(`/admin/reward/${r.id}/participants`)}
                >
                  {r.participations?.length || 0}
                </td>

                <td className="p-2 border text-center">{r.redemptions?.length || 0}</td>
                <td className="p-2 flex gap-2 justify-center">
                  {canEdit && (
                      <button
                    onClick={() => router.push(`/admin/reward/${r.id}/edit`)}
                    className="text-white px-3 py-1 rounded-lg bg-paseo"
                  >
                    แก้ไข
                  </button>
                    )}

                    {canDelete && (
                      <button
                      onClick={() => deleteReward(r.id)}
                      className="text-white px-3 py-1 rounded-lg bg-red-500"
                    >
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
          {selectedReward && (
            <div className="flex-1 sticky top-4 self-start bg-white rounded-xl shadow-lg border border-gray-200 p-6 ml-4">
              <h2 className="text-xl font-bold mb-4">พรีวิว</h2>
                <div className="space-y-4">
                
                {/* Image & Header */}
                <div className="relative">
                  {/* Image */}
                  <div className="w-full bg-gray-200 mb-4">
                    {selectedReward.imageUrl ? (
                      <Image
                        width={600}
                        height={600}
                        src={selectedReward.imageUrl}
                        alt={selectedReward.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-500">
                        ไม่มีรูปภาพ
                      </div>
                    )}
                  </div>
                  
                   <div className="flex flex-row justify-between align-start mb-4 gap-4">
                <div className="flex flex-col gap-3">
                  <h3 className="text-lg font-bold">{selectedReward.name || "ชื่อ Event"}</h3>
    
                  <div className="flex flex-row item-center align-center gap-4">
                    <FaRegCalendarCheck className="text-2xl" />
                    <p className="text-base text-gray-500">
                      ตั้งแต่ {selectedReward.startDate ? new Date(selectedReward.startDate).toLocaleString() : "-"} - {selectedReward.endDate ? new Date(selectedReward.endDate).toLocaleString() : "-"} นี้
                    </p>
                  </div>
    
                  <div className="flex flex-row item-center align-center gap-4">
                    <CiBitcoin className="text-2xl" />
                    <p className="text-base text-gray-600">ค่าใช้จ่าย: {selectedReward.pointCost} พอยต์</p>
                  </div>
    
                  <div className="flex flex-row item-center align-center gap-4">
                    <CiBitcoin className="text-2xl" />
                    <p className="text-base text-gray-600">ผู้เข้าร่วม: {selectedReward.quantity || 0} | จำกัดต่อผู้ใช้: {selectedReward.maxPerUser || 1} คน</p>
                  </div>
    
                  <div className="flex flex-row item-center align-center gap-4">
                    <CiBitcoin className="text-2xl" />
                    <p className="text-base text-gray-600">ผู้เข้าร่วมจะได้รับ: {selectedReward.pointEarn} พอยต์</p>
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
                  <p className="text-base mb-2">{selectedReward.description || "รายละเอียด..."}</p>
                </div>
    
                <div>
                  <h3 className="text-lg font-bold mb-4">เงื่อนไขกิจกรรม</h3>
                  <p className="text-base mb-2">{selectedReward.terms || "เงื่อนไข..."}</p>
                </div>
    
                  {/* Other details */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p><span className="font-semibold">ผู้เข้าร่วม:</span> {selectedReward.quantity > 0 ? `${selectedReward.quantity} คน` : "ไม่จำกัด"}</p>
                    <p><span className="font-semibold">จำกัดต่อผู้ใช้:</span> {selectedReward.maxPerUser > 0 ? `${selectedReward.maxPerUser} ครั้ง` : "ไม่จำกัด"}</p>
                    {selectedReward.pointEarn > 0 && <p><span className="font-semibold">ได้รับแต้ม:</span> {selectedReward.pointEarn} พอยต์</p>}
                  </div>
    
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>
                      <span className="font-semibold">ร้านค้า:</span>{" "}
                      {selectedReward.shops.length > 0
                        ? selectedReward.shops.map((s) => s.name).join(", ")
                        : "ยังไม่ได้เลือก"}
                    </p>
                    <p>
                      <span className="font-semibold">สาขา:</span>{" "}
                      {selectedReward.branches.length > 0
                        ? selectedReward.branches.map((b) => b.name).join(", ")
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