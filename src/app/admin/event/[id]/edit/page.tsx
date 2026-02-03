"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import TagSelector from "@/components/TagSelector";

import { PiDotsThreeOutlineLight } from "react-icons/pi";
import { LuShare2 } from "react-icons/lu";
import { FaRegCalendarCheck } from "react-icons/fa";
import { CiBitcoin } from "react-icons/ci";
import { FaStar } from "react-icons/fa";
import RichTextEditor from "@/components/RichTextEditor/page";

type Shop = { id: string; name: string };
type Branch = { id: string; name: string };

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  // Form state
  const [shopSearch, setShopSearch] = useState("");
  const [name, setName] = useState("");
  const [linkShare, setlinkShare] = useState("");
  const [description, setDescription] = useState("");
  const [terms, setTerms] = useState("");
  const [pointCost, setPointCost] = useState(0);
  const [pointEarn, setPointEarn] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [maxPerUser, setMaxPerUser] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedShops, setSelectedShops] = useState<string[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);

  // File upload
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);

  const [tags, setTags] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  // Fetch Event data
  useEffect(() => {
  if (!id) return;

  (async () => {
    try {
      const res = await fetch(`/api/admin/event/${id}`);
      if (!res.ok) throw new Error("Failed to fetch event");
      const data = await res.json();
      setName(data.name);
      setlinkShare(data.linkShare || "");
      setDescription(data.description || "");
      setTerms(data.terms || "");
      setPointCost(data.pointCost || 0);
      setPointEarn(data.pointEarn || 0);
      setQuantity(data.quantity || 0);
      setMaxPerUser(data.maxPerUser || 1);
      setStartDate(new Date(data.startDate).toISOString().slice(0,16));
setEndDate(new Date(data.endDate).toISOString().slice(0,16));     
      setSelectedBranches(data.branches?.map((b: any) => b.id) || []);
      setSelectedShops(data.shops?.map((s: any) => s.id) || []);
      setExistingImage(data.imageUrl || null);
      setTags(data.tagIds || []);
    } catch (err) {
      console.error("Error fetching event:", err);
    }
  })();
}, [id]);

  // Fetch branches & shops
  useEffect(() => {
    const loadData = async () => {
      try {
        const resShops = await fetch("/api/admin/shop");
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

  // Preview image
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  setLoading(true);

  try {
    const formData = new FormData();
    
    formData.append("name", name);
    formData.append("linkShare", linkShare);
    formData.append("description", description);
    formData.append("terms", terms);
    formData.append("pointCost", String(pointCost));
    formData.append("pointEarn", String(pointEarn));
    formData.append("quantity", String(quantity));
    formData.append("maxPerUser", String(maxPerUser));
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("tags", JSON.stringify(tags));

    if (file) formData.append("file", file);

    selectedBranches.forEach((id) => formData.append("branchIds[]", id));
    selectedShops.forEach((id) => formData.append("shopIds[]", id));

    const res = await fetch(`/api/admin/event/${id}`, {
      method: "PATCH",
      body: formData, // browser จะตั้ง Content-Type ให้เอง
    });

    if (!res.ok) {
      // พยายาม parse json ก่อน ถ้าไม่ได้ก็อ่าน text
      let errMsg = `Status ${res.status}`;
      try {
        const json = await res.json();
        errMsg = json?.error || JSON.stringify(json);
      } catch {
        try {
          errMsg = await res.text();
        } catch (e) {
          /* ignore */
        }
      }
      throw new Error(errMsg);
    }

    // ถ้าผ่าน
    router.push("/admin/event");
  } catch (err: any) {
    console.error("Update event failed:", err);
    alert("อัพเดท event ไม่สำเร็จ: " + (err.message || err));
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="w-full p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ฝั่งซ้าย = Form */}
      <div className="w-full">
        <h1 className="text-2xl font-bold mb-4">แก้ไข Event</h1>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow rounded-xl">
          {/* File upload */}
          <div>
            <label className="block mb-1 font-medium">รูป Event</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
              }}
              className="w-full"
            />
            {preview ? (
              <Image
                width={600}
                height={600}
                src={preview}
                alt="preview"
                className="w-full mt-2 rounded-lg"
              />
            ) : existingImage ? (
              <Image
                width={600}
                height={600}
                src={existingImage}
                alt="existing"
                className="w-full mt-2 rounded-lg"
              />
            ) : null}
          </div>

          <div>
            <label className="block mb-1 font-medium">ชื่อ Event</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">ลิงค์แชร์</label>
            <input
              type="text"
              value={linkShare}
              onChange={(e) => setlinkShare(e.target.value)}
              placeholder="https://thepaseo.co.th/"
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">วันที่เริ่ม</label>
              <input
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">วันที่สิ้นสุด</label>
              <input
                type="datetime-local"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">ใช้แต้ม</label>
              <input
                type="number"
                min={0}
                value={pointCost}
                onChange={(e) => setPointCost(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">ได้แต้ม</label>
              <input
                type="number"
                min={0}
                value={pointEarn}
                onChange={(e) => setPointEarn(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">จำนวนทั้งหมด</label>
              <input
                type="number"
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">จำกัดต่อผู้ใช้</label>
              <input
                type="number"
                min={1}
                value={maxPerUser}
                onChange={(e) => setMaxPerUser(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">รายละเอียด</label>
            <RichTextEditor value={description} onChange={setDescription} />
          </div>

          <div>
            <label className="block mb-1 font-medium">เงื่อนไข</label>
            <RichTextEditor value={terms} onChange={setTerms} />
          </div>

          {/* Multi-select branches */}
          <div>
            <label className="block mb-1 font-medium">สาขา</label>
            <div className="flex flex-wrap gap-2">
              {branches.map((b) => {
                const isSelected = selectedBranches.includes(b.id);
                return (
                  <span
                    key={b.id}
                    onClick={() =>
                      setSelectedBranches((prev) =>
                        isSelected
                          ? prev.filter((id) => id !== b.id)
                          : [...prev, b.id]
                      )
                    }
                    className={`px-3 py-1 rounded-lg cursor-pointer ${
                      isSelected ? "bg-paseo text-white" : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {b.name}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Multi-select shops */}
          <div>
            <label className="block mb-1 font-medium">ร้านค้า</label>
            <input
              type="text"
              placeholder="🔍 ค้นหาร้านค้า..."
              value={shopSearch}
              onChange={(e) => setShopSearch(e.target.value)}
              className="w-full border p-2 rounded-lg mb-2"
            />

            <select
              multiple
              value={selectedShops}
              onChange={(e) =>
                setSelectedShops(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="w-full px-3 py-2 border rounded"
            >
              {shops
                .filter((s) => s.name.toLowerCase().includes(shopSearch.toLowerCase()))
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>

          <TagSelector value={tags} onChange={setTags} />

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 border rounded hover:bg-gray-100"
              onClick={() => router.push("/admin/event")}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="text-white p-3 rounded-xl bg-paseo"
            >
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>

    {/* ฝั่งขวา = Preview */}
      <div className="sticky top-0 w-full p-4 mt-0 mb-20 md:mb-20 mb-4 bg-gray-100 rounded-xl border shadow-lg">
        <h2 className="text-xl font-bold mb-4">พรีวิว</h2>
        <div className="space-y-4">
          {preview ? (
            <Image
              width={600}
              height={600}
              src={preview}
              alt="preview"
              className="w-full h-48 object-cover rounded"
            />
          ) : existingImage ? (
            <Image
              width={600}
              height={600}
              src={existingImage}
              alt="existing"
              className="w-fullh-full object-cover rounded-lg mb-4"
            />
          ) : null}
          <div className="flex flex-row justify-between align-start mb-4 gap-4">
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-bold">{name || "ชื่อ Event"}</h3>

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
