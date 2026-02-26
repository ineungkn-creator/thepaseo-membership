//app/admin/receipts/add/page.tsx
"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  pointBalance: number;
}

interface ShopBranchOption {
  shopId: string;
  shopName: string;
  branchId: string;
  branchName: string;
  id: string; // `${shopId}__${branchId}`
}

type Receipt = {
  id: string
  userId: string
  user?: User | null
  phone: string | null
  amount: number
  fileUrl: string
  fileType: string
  rejectReason?: string | null
  status: "PENDING" | "APPROVED" | "REJECTED"
  reviewedBy?: string | null
  reviewedAt?: string | null
  createdAt: string
  shopId?: string | null
  branchId?: string | null
}

export default function AdminAddReceiptPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [users, setUsers] = useState<User[]>([]);
  const [shopBranches, setShopBranches] = useState<ShopBranchOption[]>([]);
  const [shopQuery, setShopQuery] = useState("");
  const [selectedShopId, setSelectedShopId] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userHistory, setUserHistory] = useState<Record<string, Receipt[]>>({})

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState("ยังไม่มีไฟล์ที่เลือก...");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [form, setForm] = useState({
    userId: "",
    amount: "",
    reviewedAt: getCurrentDate(),
    image: null as File | null,
  });

  async function fetchUserHistory(userId: string) {
    try {
      const res = await fetch(`/api/admin/receipts/history?userId=${userId}`)
      if (!res.ok) throw new Error("fetch history failed")
      const data = await res.json()
      setUserHistory((prev) => ({ ...prev, [userId]: data }))
    } catch (err) {
      console.error("fetchUserHistory error:", err)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchUser();
    }
  };
  
  const handleSearchUser = async () => {
    if (!searchPhone && !searchEmail) {
      alert("กรุณากรอกเบอร์โทรหรืออีเมล");
      return;
    }

    const query = searchPhone
      ? `phone=${encodeURIComponent(searchPhone)}`
      : `email=${encodeURIComponent(searchEmail)}`;

    try {
      const res = await fetch(`/api/admin/users/search?${query}`);
      if (!res.ok) throw new Error("User not found");
      const data = await res.json();

      setSelectedUser(data);
      setForm((prev) => ({ ...prev, userId: data.id }));

      // 🔹 โหลดประวัติ
      fetchUserHistory(data.id);
    } catch (err) {
      console.error("handleSearchUser error:", err);
      alert("ไม่พบผู้ใช้");
      setSelectedUser(null);
    }
  };

  useEffect(() => {
    fetch("/api/admin/receipts/shop")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch shops: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Shop branches data:", data);
        if (!Array.isArray(data)) {
          throw new Error("Invalid shops data: expected array");
        }
        setShopBranches(data);
        if (data.length === 0) {
          alert("ไม่พบข้อมูลร้านค้า กรุณาตรวจสอบฐานข้อมูล");
        }
      })
      .catch((err) => {
        console.error("fetchShopBranches error:", err);
        alert("ไม่สามารถโหลดข้อมูลร้านค้าและสาขาได้: " + err.message);
      });
  }, []);

  // โหลดรายชื่อผู้ใช้
  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      })
      .then((data) => {
        setUsers(data.users);
      })
      .catch((err) => {
        console.error("fetchUsers error:", err);
        alert("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
      });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSearchPhone = async () => {
    if (!searchPhone) return;
    try {
      const res = await fetch(`/api/admin/users/search?phone=${searchPhone}`);
      if (!res.ok) throw new Error("User not found");
      const data = await res.json();
      if (data) {
        setSelectedUser(data);
        setForm((prev) => ({ ...prev, userId: data.id }));
      } else {
        alert("ไม่พบผู้ใช้");
        setSelectedUser(null);
      }
    } catch (err) {
      console.error("handleSearchPhone error:", err);
      alert("ไม่พบผู้ใช้");
      setSelectedUser(null);
    }
  };

  // กรองร้านค้าและสาขา
  const filteredShopBranches = () => {
    if (!shopQuery) return shopBranches;
    return shopBranches.filter((s) =>
      `${s.shopName} ${s.branchName}`.toLowerCase().includes(shopQuery.toLowerCase())
    );
  };

  const handleSubmit = async () => {
    if (!form.userId || !form.amount || !selectedShopId) {
      alert("กรุณากรอกข้อมูลให้ครบ: ผู้ใช้, จำนวนเงิน, ร้านค้า/สาขา");
      return;
    }

    const amountValue = Number(form.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      alert("กรุณากรอกจำนวนเงินที่ถูกต้อง");
      return;
    }

    const [shopId, branchId] = selectedShopId.split("__");

    try {
      // ✅ ดึง point setting ปัจจุบัน
      const settingRes = await fetch("/api/admin/points/general_setting");
      if (!settingRes.ok) throw new Error("โหลดการตั้งค่าพอยต์ไม่สำเร็จ");
      const setting = await settingRes.json();

      // ✅ คำนวณพอยท์ตาม rate
      const calcRes = await fetch("/api/admin/points/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: amountValue,
            shopId,
          }),
        });

        if (!calcRes.ok) throw new Error("คำนวณพอยท์ไม่สำเร็จ");

        const { points: pointsToAdd } = await calcRes.json();

      // ✅ แสดงกล่องยืนยัน
      const confirmMsg = `
  ⚡ ยืนยันการเพิ่มใบเสร็จ ⚡

  ชื่อ: ${selectedUser?.name || "-"}
  เบอร์โทร: ${selectedUser?.phone || "-"}
  อีเมล: ${selectedUser?.email || "-"}
  จำนวนเงิน: ${amountValue.toLocaleString("th-TH")} บาท
  จะได้รับพอยต์: ${pointsToAdd.toLocaleString("th-TH")} พอยท์

  ต้องการบันทึกใบเสร็จนี้หรือไม่?
      `.trim();

      const confirmed = window.confirm(confirmMsg);
      if (!confirmed) return; // ❌ ถ้ายกเลิก ไม่ทำต่อ

      // ✅ สร้าง FormData สำหรับส่งไป API
      const fd = new FormData();
      fd.append("userId", form.userId);
      fd.append("amount", form.amount);
      fd.append("shopId", shopId);
      fd.append("branchId", branchId);
      fd.append("reviewedAt", form.reviewedAt);
      if (form.image) fd.append("file", form.image);

      const res = await fetch("/api/admin/receipts", {
        method: "POST",
        body: fd,
      });

      if (res.ok) {
        alert("✅ เพิ่มใบเสร็จสำเร็จ");
        setForm({ userId: "", amount: "", reviewedAt: getCurrentDate(), image: null });
        setSelectedUser(null);
        setSearchPhone("");
        setSelectedShopId("");
        setShopQuery("");
        setFileName("ยังไม่มีไฟล์ที่เลือก...");
        setImagePreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        const error = await res.json();
        alert("เกิดข้อผิดพลาด: " + (error.error || "ไม่ทราบสาเหตุ"));
      }
    } catch (err) {
      console.error("handleSubmit error:", err);
      alert("เกิดข้อผิดพลาดขณะบันทึกใบเสร็จ");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFileName(file.name);
      setForm({ ...form, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFileName("ยังไม่มีไฟล์ที่เลือก...");
      setForm({ ...form, image: null });
      setImagePreviewUrl(null);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg flex flex-col gap-4">
      <h1 className="font-bold text-lg mb-4">เพิ่มใบเสร็จให้ลูกค้า</h1>

      {/* ค้นหาเบอร์โทร */}
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          ค้นหาผู้ใช้ด้วยเบอร์โทรศัพท์หรืออีเมล
        </label>


        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="เบอร์โทรศัพท์"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-1/2 pt-2 pb-2 pl-4 pr-4 border rounded-full"
          />
          <input
            type="email"
            placeholder="อีเมล"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-1/2 pt-2 pb-2 pl-4 pr-4 border rounded-full"
          />
          <button
            onClick={handleSearchUser}
            className="text-white px-4 py-2 rounded-full disabled:opacity-50"
            style={{ backgroundColor: "#9DC93C" }}
          >
            ค้นหา
          </button>
        </div>
        
      </div>

      {/* แสดงข้อมูลผู้ใช้ถ้าเจอ */}
      {selectedUser && (
        <div className="border p-3 rounded-lg shadow-md bg-white mb-4 flex flex-row">
          <div className="flex flex-col w-50%">
            <div className="flex items-center mb-2">
              <strong className="w-32 font-semibold">ชื่อ:</strong>
              <p className="w-64 font-normal">{selectedUser.name}</p>
            </div>
            <div className="flex items-center mb-2">
              <strong className="w-32 font-semibold">เบอร์:</strong>
              <p className="w-64 font-normal">{selectedUser.phone}</p>
            </div>
            <div className="flex items-center mb-2">
              <strong className="w-32 font-semibold">Email:</strong>
              <p className="w-64 font-normal">{selectedUser.email}</p>
            </div>
            <div className="flex items-center mb-2">
              <strong className="w-32 font-semibold">วันเกิด:</strong>
              <p className="w-64 font-normal">
                {new Date(selectedUser.dateOfBirth).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center mb-2">
              <strong className="w-32 font-semibold">เพศ:</strong>
              <p className="w-64 font-normal">{selectedUser.gender}</p>
            </div>
            <div className="flex items-center mb-2">
              <strong className="w-32 font-semibold">Point:</strong>
              <p className="w-64 font-normal">{selectedUser.pointBalance.toLocaleString("th-TH")}</p>
            </div>
          </div>

          <div className="flex flex-col w-50%">
                <div className="flex-1">
                  <h2 className="font-bold mb-2">📜 ประวัติการส่งใบเสร็จ</h2>
                  {userHistory[selectedUser.id] ? (
                    userHistory[selectedUser.id].length > 0 ? (
                      <table className="w-full border text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border px-2 py-1">วันที่</th>
                            <th className="border px-2 py-1">ร้านค้า</th>
                            <th className="border px-2 py-1">สาขา</th>
                            <th className="border px-2 py-1">จำนวนเงิน</th>
                            <th className="border px-2 py-1">สถานะ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userHistory[selectedUser.id].map((h) => (
                            <tr key={h.id}>
                              <td className="border px-2 py-1">
                                {new Date(h.createdAt).toLocaleDateString("th-TH")}
                              </td>
                              <td className="border px-2 py-1">{(h as any).shop?.name || "-"}</td>
                              <td className="border px-2 py-1">{(h as any).branch?.name || "-"}</td>
                              <td className="border px-2 py-1 text-right">
                                {h.amount.toLocaleString("th-TH")}
                              </td>
                              <td className="border px-2 py-1">{h.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p>ยังไม่มีประวัติการส่งใบเสร็จ</p>
                    )
                  ) : (
                    <p>กำลังโหลด...</p>
                  )}
                </div>
          </div>
          
        </div>
      )}

      {/* จำนวนเงิน */}
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">จำนวนเงิน</label>
        <input
          type="number"
          placeholder="จำนวนเงิน"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="w-full pt-2 pb-2 pl-4 pr-4 border rounded-full"
        />
      </div>

      {/* วันที่ */}
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">วันที่</label>
        <input
          type="date"
          value={form.reviewedAt}
          onChange={(e) => setForm({ ...form, reviewedAt: e.target.value })}
          className="w-full pt-2 pb-2 pl-4 pr-4 border rounded-full"
        />
      </div>

      {/* เลือกร้านค้าและสาขา */}
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">เลือกร้านค้า / สาขา</label>
        <input
          className="w-full pt-2 pb-2 pl-4 pr-4 border rounded-full mb-2"
          placeholder="ค้นหาร้านหรือสาขา..."
          value={shopQuery}
          onChange={(e) => setShopQuery(e.target.value)}
        />
        <div className="border rounded max-h-48 overflow-y-auto">
          {shopBranches.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              กำลังโหลดร้านค้า... หรือไม่มีข้อมูลร้านค้า
            </div>
          ) : filteredShopBranches().length > 0 ? (
            filteredShopBranches().map((s) => (
              <div
                key={s.id}
                className={`p-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center ${
                  selectedShopId === s.id ? "bg-gray-100 border-l-4 border-paseo" : ""
                }`}
                onClick={() => setSelectedShopId(s.id)}
              >
                <span className="font-medium">{s.shopName}</span>
                <span className="text-gray-600">— {s.branchName}</span>
                {selectedShopId === s.id && (
                  <span className="text-paseo text-xs ml-2">✓ เลือกแล้ว</span>
                )}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500 text-center">ไม่พบร้านหรือสาขาที่ค้นหา</div>
          )}
        </div>
      </div>

      {/* อัปโหลดภาพ */}
      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">อัปโหลดภาพใบเสร็จ</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-between border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-paseo transition-colors duration-200"
        >
          <span className="text-gray-500">{fileName}</span>
          <button
            type="button"
            className="text-white font-semibold py-2 px-4 rounded-full"
            style={{ backgroundColor: "#9DC93C" }}
          >
            เลือกไฟล์
          </button>
          <input
            id="slip"
            name="slip"
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
        {imagePreviewUrl && (
          <div className="mt-4">
            <Image
              width={600}
              height={600}
              src={imagePreviewUrl}
              alt="Preview"
              className="max-w-full h-auto rounded-lg shadow-md mx-auto"
            />
          </div>
        )}
      </div>

      {/* ปุ่มบันทึก */}
      <button
        onClick={handleSubmit}
        className="text-white px-4 py-2 rounded-full disabled:opacity-50"
        style={{ backgroundColor: "#9DC93C" }}
      >
        บันทึก
      </button>
    </div>
  );
}