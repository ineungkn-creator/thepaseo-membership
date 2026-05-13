"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import RichTextEditor from "@/components/RichTextEditor/page";

import { PiDotsThreeOutlineLight } from "react-icons/pi";
import { LuShare2 } from "react-icons/lu";
import { FaRegCalendarCheck } from "react-icons/fa";
import { CiBitcoin } from "react-icons/ci";
import { FaStar } from "react-icons/fa";

type Shop = { id: string; name: string };
type Branch = { id: string; name: string };

export default function AddCampaignPage() {
  const router = useRouter();

  // form state
  const [shopSearch, setShopSearch] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [linkShare, setlinkShare] = useState("");
  const [terms, setTerms] = useState("");
  const [pointCost, setPointCost] = useState(0);
  const [pointEarn, setPointEarn] = useState(0);
  const [quantity, setquantity] = useState<number | null>(null);
  const [maxPerUser, setMaxPerUser] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [shops, setShops] = useState<Shop[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedShops, setSelectedShops] = useState<string[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);

  // โหลด shops / branches จาก API
  useEffect(() => {
    const loadData = async () => {
      try {
        const resShops = await fetch("/api/admin/shop?take=9999");
        const dataShops = await resShops.json();
        setShops(Array.isArray(dataShops) ? dataShops : dataShops.shops || []);

        const resBranches = await fetch("/api/admin/branches");
        const dataBranches = await resBranches.json();
        setBranches(Array.isArray(dataBranches) ? dataBranches : dataBranches.branches || []);
      } catch (error) {
        console.error("❌ Error fetching shops/branches:", error);
        setShops([]);
        setBranches([]);
      }
    };

    loadData();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("linkShare", linkShare);
    formData.append("terms", terms);
    formData.append("pointCost", pointCost.toString());
    formData.append("pointEarn", pointEarn.toString());
    if (quantity !== null) formData.append("quantity", quantity.toString());
    if (maxPerUser !== null) formData.append("maxPerUser", maxPerUser.toString());
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    if (image) formData.append("file", image);
    selectedShops.forEach((id) => formData.append("shopIds[]", id));
    selectedBranches.forEach((id) => formData.append("branchIds[]", id));

    const res = await fetch("/api/admin/campaign", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      router.push("/admin/campaign");
    } else {
      const err = await res.json();
      alert("Error: " + err.error);
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* ฟอร์มกรอก */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow rounded-lg">
        <h1 className="text-2xl font-bold mb-4">เพิ่มแคมเปญ</h1>

        <div>
          <label className="block mb-1 font-medium">รูปภาพ</label>
          <input className="file-input" type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        <div>
          <label className="block mb-1 font-medium">ชื่อแคมเปญ</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">ลิงค์แชร์</label>
          <input
            type="text"
            value={linkShare}
            onChange={(e) => setlinkShare(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">รายละเอียด</label>
          <RichTextEditor value={description} onChange={setDescription} />
        </div>

        <div>
          <label className="block mb-1 font-medium">เงื่อนไข</label>
          <RichTextEditor value={terms} onChange={setTerms} />
        </div>

        

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">วันที่เริ่ม</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">วันที่สิ้นสุด</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Point Cost</label>
            <input
              type="number"
              value={pointCost}
              onChange={(e) => setPointCost(parseInt(e.target.value || "0"))}
              className="input"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Point Earn</label>
            <input
              type="number"
              value={pointEarn}
              onChange={(e) => setPointEarn(parseInt(e.target.value || "0"))}
              className="input"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">จำนวนสูงสุดทั้งหมด</label>
            <input
              type="number"
              value={quantity ?? ""}
              onChange={(e) =>
                setquantity(e.target.value ? parseInt(e.target.value) : null)
              }
              className="input"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">จำกัดต่อ User</label>
            <input
              type="number"
              value={maxPerUser ?? ""}
              onChange={(e) =>
                setMaxPerUser(e.target.value ? parseInt(e.target.value) : null)
              }
              className="input"
            />
          </div>
        </div>

        {/* Branch select */}
        <div>
          <label className="block mb-1 font-medium">สาขา</label>
          <div className="flex flex-wrap gap-2">
            {branches.map((b) => {
              const isSelected = selectedBranches.includes(b.id);
              return (
                <span
                  key={b.id}
                  className={`px-3 py-1 rounded-lg cursor-pointer ${
                    isSelected ? "bg-paseo text-white" : "bg-gray-200 text-gray-800"
                  }`}
                  onClick={() =>
                    setSelectedBranches(
                      isSelected
                        ? selectedBranches.filter((id) => id !== b.id)
                        : [...selectedBranches, b.id]
                    )
                  }
                >
                  {b.name}
                </span>
              );
            })}
          </div>
        </div>

        {/* Shop select */}
        <div>
          <label className="block mb-1 font-medium">ร้านค้า / จุดแลกรางวัล</label>

            <input
              type="text"
              placeholder="🔍 ค้นหาร้านค้า..."
              value={shopSearch}
              onChange={(e) => setShopSearch(e.target.value)}
              className="input mb-2"
            />

          <label className="block mb-1 font-medium">ร้านค้า</label>
          <select
            multiple
            value={selectedShops}
            onChange={(e) =>
              setSelectedShops(Array.from(e.target.selectedOptions, (o) => o.value))
            }
            className="input"
          >
            {shops
              .filter((s) =>
                s.name.toLowerCase().includes(shopSearch.toLowerCase())
              )
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-paseo text-white rounded-lg hover:bg-paseo-hover disabled:opacity-50"
        >
          บันทึก
        </button>
      </form>

      {/* พรีวิว */}
      <div className="ิrelative w-full p-4 mt-0 mb-20 md:mb-20 mb-4 bg-gray-100 rounded-lg border shadow-lg">
        <h2 className="text-xl font-bold mb-4">พรีวิว</h2>
          <div className="space-y-4">

          {preview ? (
            <Image
              width={600}
              height={600}
              src={preview}
              alt="preview"
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg">
              <span className="text-gray-500">ยังไม่มีรูป</span>
            </div>
          )}

        <div className="flex flex-row justify-between align-start mb-4 gap-4">
                          <div className="flex flex-col gap-3">
                            <h3 className="text-lg font-bold">{name || "ชื่อแคมเปญ"}</h3>
              
                            <div className="flex flex-row item-center align-center gap-4">
                              <FaRegCalendarCheck className="text-2xl" />
                              <p className="text-base text-gray-500">
                                ตั้งแต่ {startDate ? new Date(startDate).toLocaleString() : "-"} - {endDate ? new Date(endDate).toLocaleString() : "-"} นี้
                              </p>
                            </div>
              
                            <div className="flex flex-row item-center align-center gap-4">
                              <CiBitcoin className="text-2xl" />
                              <p className="text-base text-gray-600">ค่าใช้จ่าย: {pointCost} พอยต์</p>
                            </div>
              
                            <div className="flex flex-row item-center align-center gap-4">
                              <CiBitcoin className="text-2xl" />
                              <p className="text-base text-gray-600">ผู้เข้าร่วม: {quantity || 0} | จำกัดต่อผู้ใช้: {maxPerUser || 1} คน</p>
                            </div>
              
                            <div className="flex flex-row item-center align-center gap-4">
                              <CiBitcoin className="text-2xl" />
                              <p className="text-base text-gray-600">ผู้เข้าร่วมจะได้รับ: {pointEarn} พอยต์</p>
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
                            <div
                              className="prose text-base mb-2 prose-ol:list-decimal prose-ol:pl-6 prose-ul:list-disc prose-ul:pl-6"
                              dangerouslySetInnerHTML={{ __html: description || "<p>ยังไม่มีรายละเอียด...</p>" }}
                            />
                          </div>
              
                          <div>
                            <h3 className="text-lg font-bold mb-4">เงื่อนไขกิจกรรม</h3>
                            <div
                              className="prose text-base mb-2 prose-ol:list-decimal prose-ol:pl-6 prose-ul:list-disc prose-ul:pl-6"
                              dangerouslySetInnerHTML={{ __html: terms || "<p>ยังไม่มีเงื่อนไข...</p>" }}
                            />
                          </div>
              
                          <div className="text-sm text-gray-700 space-y-1">
                          <p>
                            <span className="font-semibold">ร้านค้า:</span>{" "}
                            {selectedShops.length > 0
                              ? shops
                                  .filter((s) => selectedShops.includes(s.id))
                                  .map((s) => s.name)
                                  .join(", ")
                              : "ยังไม่ได้เลือก"}
                          </p>
                          <p>
                            <span className="font-semibold">สาขา:</span>{" "}
                            {selectedBranches.length > 0
                              ? branches
                                  .filter((b) => selectedBranches.includes(b.id))
                                  .map((b) => b.name)
                                  .join(", ")
                              : "ยังไม่ได้เลือก"}
                          </p>
                        </div>
              
                      </div>
                      
                    </div>
                  </div>
                );
              }
              