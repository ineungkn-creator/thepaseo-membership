"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { hasPermission, PERMISSIONS } from "@/lib/auth/permissions";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

import { PiDotsThreeOutlineLight } from "react-icons/pi";
import { LuShare2 } from "react-icons/lu";
import { FaRegCalendarCheck } from "react-icons/fa";
import { CiBitcoin } from "react-icons/ci";
import { FaStar } from "react-icons/fa";

import { IoIosAddCircle } from "react-icons/io";

type Campaign = {
  id: string;
  code: string;
  imageUrl: string;
  name: string;
  description: string | null;
  terms: string | null;
  startDate: string;
  endDate: string;
  pointCost: number;
  quantity: number;
  maxPerUser: number;
  pointEarn: number;
  branches: { id: string; name: string }[];
  shops: { id: string; name: string }[];
  _count: { participations: number };
};

type CampaignData = {
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
  imageUrl: string;
  branches: { id: string; name: string }[];
  shops: { id: string; name: string }[];
  registrations: any[];
  redemptions: any[];
  createdAt: string;
};

export default function AdminCampaignPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | CampaignData | null>(null);
  const router = useRouter();

  const { data: session } = useSession();
  const role = session?.user?.role;

  const canEdit =
    role && hasPermission(role, PERMISSIONS.CAMPAIGN_EDIT);

  const canDelete =
    role && hasPermission(role, PERMISSIONS.CAMPAIGN_DELETE);
  
  const fetchCampaigns = async (page: number) => {
    try {
      const res = await fetch(`/api/admin/campaign?page=${page}`);
      const data = await res.json();
      setCampaigns(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
    }
  };
  
  useEffect(() => {
    fetchCampaigns(page);
  }, [page]);

  const deleteCampaign = async (id: string) => {
    if (!confirm("ยืนยันการลบ campagin?")) return;
    await fetch(`/api/admin/campaign/${id}`, { method: "DELETE" });
    fetchCampaigns(page);
  };

  const handleSelectCampaign = (campaign: Campaign | CampaignData) => {
    setSelectedCampaign(campaign);
  };

  return (
    <div className="flex w-full min-h-screen">
      {/* ส่วนตารางหลัก */}
      <div className="bg-white p-4 rounded-lg flex-1 mr-4">
        <div className="flex flex-row justify-between mb-4">

          <h1 className="text-2xl font-bold">จัดการแคมเปญ</h1>
          <Link
            href="/admin/campaign/create"
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
              <th className="p-2 border">วันที่เริ่ม</th>
              <th className="p-2 border">วันที่สิ้นสุด</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td
                  className="p-2 cursor-pointer text-text-active font-medium hover:underline"
                  onClick={() => handleSelectCampaign(c)}
                >
                  {c.name}
                </td>
                <td className="p-2 border">
                  {c.branches?.map((b) => (
                    <Badge className="text-white mr-2" key={b.id}>{b.name}</Badge>
                  ))}
                </td>
                <td className="p-2 border">
                  {c.shops?.map((s) => (
                    <Badge className="text-white mr-2" key={s.id}>{s.name}</Badge>
                  ))}
                </td>
                <td className="p-2 border">{new Date(c.startDate).toLocaleDateString()}</td>
                <td className="p-2 border">{new Date(c.endDate).toLocaleDateString()}</td>
                {/* <td className="p-2 border cursor-pointer text-center text-text-active"
                  onClick={() => router.push(`/admin/campaign/${c.id}/participants`)}
                >{c._count.participations}</td> */}
                <td className="p-2 flex gap-2 justify-center">
                  {canEdit && (
                    <button
                      onClick={() => router.push(`/admin/campaign/${c.id}/edit`)}
                      className="text-white px-3 py-1 rounded-lg bg-paseo"
                    >
                      แก้ไข
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={() => deleteCampaign(c.id)}
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
            className={`px-3 py-1 border rounded-lg ${p === page ? "bg-paseo text-white" : ""}`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
    
    {/* ส่วน Preview Panel */}
          {selectedCampaign && (
            <div className="flex-1 sticky top-4 self-start bg-white rounded-xl shadow-lg border border-gray-200 p-6 ml-4">
              <h2 className="text-xl font-bold mb-4">พรีวิว</h2>
                <div className="space-y-4">
                
                {/* Image & Header */}
                <div className="relative">
                  {/* Image */}
                  <div className="w-full bg-gray-200 mb-4">
                    {selectedCampaign.imageUrl ? (
                      <Image
                        width={600}
                        height={600}
                        src={selectedCampaign.imageUrl}
                        alt={selectedCampaign.name}
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
                  <h3 className="text-lg font-bold">{selectedCampaign.name || "ชื่อ Event"}</h3>
    
                  <div className="flex flex-row item-center align-center gap-4">
                    <FaRegCalendarCheck className="text-2xl" />
                    <p className="text-base text-gray-500">
                      ตั้งแต่ {selectedCampaign.startDate ? new Date(selectedCampaign.startDate).toLocaleString() : "-"} - {selectedCampaign.endDate ? new Date(selectedCampaign.endDate).toLocaleString() : "-"} นี้
                    </p>
                  </div>
    
                  <div className="flex flex-row item-center align-center gap-4">
                    <CiBitcoin className="text-2xl" />
                    <p className="text-base text-gray-600">ค่าใช้จ่าย: {selectedCampaign.pointCost} พอยต์</p>
                  </div>
    
                  <div className="flex flex-row item-center align-center gap-4">
                    <CiBitcoin className="text-2xl" />
                    <p className="text-base text-gray-600">ผู้เข้าร่วม: {selectedCampaign.quantity || 0} | จำกัดต่อผู้ใช้: {selectedCampaign.maxPerUser || 1} คน</p>
                  </div>
    
                  <div className="flex flex-row item-center align-center gap-4">
                    <CiBitcoin className="text-2xl" />
                    <p className="text-base text-gray-600">ผู้เข้าร่วมจะได้รับ: {selectedCampaign.pointEarn} พอยต์</p>
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
                  <p className="text-base mb-2">{selectedCampaign.description || "รายละเอียด..."}</p>
                </div>
    
                <div>
                  <h3 className="text-lg font-bold mb-4">เงื่อนไขกิจกรรม</h3>
                  <p className="text-base mb-2">{selectedCampaign.terms || "เงื่อนไข..."}</p>
                </div>
    
                  {/* Other details */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p><span className="font-semibold">ผู้เข้าร่วม:</span> {selectedCampaign.quantity > 0 ? `${selectedCampaign.quantity} คน` : "ไม่จำกัด"}</p>
                    <p><span className="font-semibold">จำกัดต่อผู้ใช้:</span> {selectedCampaign.maxPerUser > 0 ? `${selectedCampaign.maxPerUser} ครั้ง` : "ไม่จำกัด"}</p>
                    {selectedCampaign.pointEarn > 0 && <p><span className="font-semibold">ได้รับแต้ม:</span> {selectedCampaign.pointEarn} พอยต์</p>}
                  </div>
    
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>
                      <span className="font-semibold">ร้านค้า:</span>{" "}
                      {selectedCampaign.shops.length > 0
                        ? selectedCampaign.shops.map((s) => s.name).join(", ")
                        : "ยังไม่ได้เลือก"}
                    </p>
                    <p>
                      <span className="font-semibold">สาขา:</span>{" "}
                      {selectedCampaign.branches.length > 0
                        ? selectedCampaign.branches.map((b) => b.name).join(", ")
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