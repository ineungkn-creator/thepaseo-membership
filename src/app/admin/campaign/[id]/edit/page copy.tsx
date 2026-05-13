"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

type Shop = { id: string; name: string };
type Branch = { id: string; name: string };

export default function EditCampaignPage() {
  const { id } = useParams();
  const router = useRouter();

  // state
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [terms, setTerms] = useState("");
  const [pointCost, setPointCost] = useState(0);
  const [pointEarn, setPointEarn] = useState(0);
  const [quantity, setQuantity] = useState<number | null>(null);
  const [maxPerUser, setMaxPerUser] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [shops, setShops] = useState<Shop[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedShops, setSelectedShops] = useState<string[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);

  // โหลด campaign detail
  useEffect(() => {
    if (id) {
      fetch(`/api/admin/campaign/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setCode(data.code);
          setName(data.name);
          setDescription(data.description || "");
          setTerms(data.terms || "");
          setPointCost(data.pointCost || 0);
          setPointEarn(data.pointEarn || 0);
          setQuantity(data.quantity);
          setMaxPerUser(data.maxPerUser);
          setStartDate(data.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : "");
          setEndDate(data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : "");
          if (data.imageUrl) setPreview(data.imageUrl);
          setSelectedShops(data.shops.map((s: Shop) => s.id));
          setSelectedBranches(data.branches.map((b: Branch) => b.id));
        });
    }
  }, [id]);

  // โหลด shops / branches
  useEffect(() => {
    fetch("/api/admin/shop").then((res) => res.json()).then(setShops);
    fetch("/api/admin/branches").then((res) => res.json()).then(setBranches);
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
    formData.append("code", code);
    formData.append("name", name);
    formData.append("description", description);
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

    const res = await fetch(`/api/admin/campaign/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (res.ok) {
      router.push(`/admin/campaign/${id}`);
    } else {
      const err = await res.json();
      alert("Error: " + err.error);
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* ฟอร์มแก้ไข */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="text-2xl font-bold mb-4">แก้ไข Campaign</h1>

        <div>
          <label className="block mb-1 font-medium">Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="input"
            required
          />
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
          <label className="block mb-1 font-medium">รายละเอียด</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">เงื่อนไข</label>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">รูปภาพ</label>
          <input className="file-input" type="file" accept="image/*" onChange={handleImageChange} />
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
                setQuantity(e.target.value ? parseInt(e.target.value) : null)
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
                  className={`px-3 py-1 rounded cursor-pointer ${
                    isSelected ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
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
          <label className="block mb-1 font-medium">ร้านค้า</label>
          <select
            multiple
            value={selectedShops}
            onChange={(e) =>
              setSelectedShops(Array.from(e.target.selectedOptions, (o) => o.value))
            }
            className="input"
          >
            {shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-paseo text-white rounded hover:bg-paseo-hover"
        >
          บันทึกการแก้ไข
        </button>
      </form>

      {/* Preview */}
      <div className="bg-gray-50 p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-bold mb-4">พรีวิว</h2>
        {preview ? (
          <Image
            width={600}
            height={600}
            src={preview}
            alt="preview"
            className="w-full h-48 object-cover rounded"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded">
            <span className="text-gray-500">ยังไม่มีรูป</span>
          </div>
        )}

        <h3 className="text-lg font-bold">{name || "ชื่อแคมเปญ"}</h3>
        <p className="text-sm text-gray-600">{description || "รายละเอียด..."}</p>
        <p className="text-xs text-gray-500 italic">{terms || "เงื่อนไข..."}</p>

        <div className="flex gap-4 text-sm">
          <span>ใช้ {pointCost} แต้ม</span>
          <span>ได้ {pointEarn} แต้ม</span>
        </div>

        <div className="text-sm">
          สูงสุด: {quantity ?? "-"} | ต่อผู้ใช้: {maxPerUser ?? "-"}
        </div>

        <div className="text-sm text-gray-600">
          เริ่ม: {startDate ? new Date(startDate).toLocaleString() : "-"}
          <br />
          สิ้นสุด: {endDate ? new Date(endDate).toLocaleString() : "-"}
        </div>

        <div className="text-sm">
          <strong>สาขาที่เลือก:</strong>{" "}
          {branches
            .filter((b) => selectedBranches.includes(b.id))
            .map((b) => b.name)
            .join(", ") || "-"}
          <br />
          <strong>ร้านค้าที่เลือก:</strong>{" "}
          {shops
            .filter((s) => selectedShops.includes(s.id))
            .map((s) => s.name)
            .join(", ") || "-"}
        </div>
      </div>
    </div>
  );
}
