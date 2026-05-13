//app/admin/receipts/page.tsx
"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link";
import Image from "next/image";
import Loading from '@/components/loading';

import { IoIosAddCircle } from "react-icons/io";

type User = {
  id: string
  name: string
  phone: string | null
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
  receiptNumber?: string | null
  receiptDate?: string | null
  receiptTime?: string | null
}

type ShopBranchOption = {
  shopId: string
  shopName: string
  branchId: string
  branchName: string
  id: string // `${shopId}__${branchId}`
}

const REJECT_REASONS = [
  "ไม่ใช่รูปบิลใบเสร็จ ภายในศูนย์การค้า เดอะ พาซิโอ",
  "รูปไม่ชัดเจน",
  "ใบเสร็จไม่สามารถสะสมย้อนหลังได้เกิน 3 วัน"
]

export default function AdminReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedReceiptId, setExpandedReceiptId] = useState<string | null>(null)
  const [shopBranches, setShopBranches] = useState<ShopBranchOption[]>([])
  const [shopQuery, setShopQuery] = useState("")
  const [editing, setEditing] = useState<{ 
    amount?: number
    selectedShopId?: string
    receiptNumber?: string
    receiptDate?: string
    receiptTime?: string
  }>({})
  const [actionLoading, setActionLoading] = useState(false)
  const [userHistory, setUserHistory] = useState<Record<string, Receipt[]>>({})

  useEffect(() => {
    fetchReceipts()
    fetchShopBranches()
  }, [])

  async function fetchReceipts() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/receipts")
      if (!res.ok) throw new Error(`fetch receipts failed: ${res.status}`)
      const data = await res.json()
      setReceipts(data)
    } catch (err) {
      console.error("fetchReceipts error:", err)
      alert("โหลดรายการใบเสร็จล้มเหลว")
    } finally {
      setLoading(false)
    }
  }

  const checkReceipt = async (receiptNumber: string) => {
    if (!receiptNumber || !editing.selectedShopId) return;

    const [shopId] = editing.selectedShopId.split("__");

    const res = await fetch("/api/admin/receipts/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiptNumber,
        shopId,
      }),
    });

    const data = await res.json();

    if (data.duplicate) {
      alert(
        `⚠ เลขใบเสร็จนี้ถูกใช้แล้ว\n\nผู้ใช้: ${data.data.user?.name}\nเบอร์: ${data.data.user?.phone}`
      );
    }
  };

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

  async function fetchShopBranches() {
    try {
      const res = await fetch("/api/admin/receipts/shop")
      if (!res.ok) {
        throw new Error(`Failed to fetch shops: ${res.status} ${res.statusText}`)
      }
      const data = await res.json()
      console.log("Shop branches data:", data) // Debug log

      if (!Array.isArray(data)) {
        throw new Error("Invalid shops data: expected array")
      }

      setShopBranches(data)
      if (data.length === 0) {
        console.warn("No shop branches found")
        alert("ไม่พบข้อมูลร้านค้า กรุณาตรวจสอบฐานข้อมูล")
      }
    } catch (err) {
      console.error("fetchShopBranches error:", err)
      alert("ไม่สามารถโหลดข้อมูลร้านค้าและสาขาได้: " + (err as Error).message)
    }
  }

  const filteredShopBranches = () => {
    if (!shopQuery) return shopBranches
    return shopBranches.filter((s) =>
      `${s.shopName} ${s.branchName}`.toLowerCase().includes(shopQuery.toLowerCase())
    )
  }

  const patchReceipt = async (payload: any) => {
    setActionLoading(true)
    try {
      const res = await fetch("/api/admin/receipts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: payload.id,
          status: payload.status,
          rejectReason: payload.rejectReason ?? null,
          amount: payload.amount ? Number(payload.amount) : null,
          receiptNumber: payload.receiptNumber ?? null,
          receiptDate: payload.receiptDate ?? null,
          receiptTime: payload.receiptTime ?? null,
          shopId: payload.shopId ?? null,
          branchId: payload.branchId ?? null,
        }),
      })
      if (!res.ok) {
        const error = await res.json()
        console.error("PATCH error:", error)
        throw new Error(error.error || "Patch failed")
      }
      await fetchReceipts()
      alert("บันทึกเรียบร้อย")
    } catch (err) {
      console.error("patchReceipt error:", err)
      alert("เกิดข้อผิดพลาดขณะบันทึก: " + (err as Error).message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleApprove = async (receiptId: string) => {
    if (!editing.amount && editing.amount !== 0) {
      alert("กรุณากรอกจำนวนเงิน");
      return;
    }
    if (!editing.selectedShopId) {
      alert("กรุณาเลือกร้าน/สาขาก่อนอนุมัติ");
      return;
    }

    const amountValue = Number(editing.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      alert("กรุณากรอกจำนวนเงินที่ถูกต้อง");
      return;
    }

    const [shopId, branchId] = editing.selectedShopId.split("__");

    try {
      // ✅ ดึงค่า rate ปัจจุบันจาก setting
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

      // ✅ ดึงข้อมูลใบเสร็จนี้เพื่อดูชื่อผู้ใช้
      const r = receipts.find((x) => x.id === receiptId);
      const user = r?.user;

      // ✅ สร้างข้อความยืนยัน
      const confirmMsg = `
        ⚡ ยืนยันอนุมัติใบเสร็จ ⚡

        ชื่อ: ${user?.name || "-"}
        เบอร์โทร: ${user?.phone || "-"}
        จำนวนเงิน: ${amountValue.toLocaleString("th-TH")} บาท
        จะได้รับพอยท์: ${pointsToAdd.toLocaleString("th-TH")} พอยท์

        ต้องการอนุมัติใบเสร็จนี้หรือไม่?
      `.trim();

      const confirmed = window.confirm(confirmMsg);
      if (!confirmed) return;

      // ✅ PATCH API
      await patchReceipt({
        id: receiptId,
        status: "APPROVED",
        amount: editing.amount,
        shopId,
        branchId,

        receiptNumber: editing.receiptNumber,
        receiptDate: editing.receiptDate,
        receiptTime: editing.receiptTime,
      });

      alert(`✅ อนุมัติสำเร็จ\nผู้ใช้ได้รับ ${pointsToAdd} พอยท์`);
      setExpandedReceiptId(null);
      setEditing({});
    } catch (err) {
      console.error("handleApprove error:", err);
      alert("เกิดข้อผิดพลาดขณะอนุมัติใบเสร็จ");
    }
  };

  const handleReject = async (receiptId: string, reason: string) => {
    if (!reason) return alert("กรุณาเลือกเหตุผลการปฏิเสธ")
    if (!confirm("ยืนยันปฏิเสธใบเสร็จรายการนี้?")) return
    await patchReceipt({ id: receiptId, status: "REJECTED", rejectReason: reason })
    setExpandedReceiptId(null)
    setEditing({})
  }

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleString("th-TH") : "-"

  if (loading) return <Loading />

  return (
    <div className="bg-white md:p-4 p-2 rounded-lg flex-1">
      <div className="flex flex-row justify-between mb-4">
        <h1 className="text-2xl font-bold">จัดการใบเสร็จ</h1>
        <Link
          href="/admin/receipts/add"
          className="flex flex-row items-center gap-2 px-4 py-2 bg-paseo text-white rounded-lg"
          >
        <IoIosAddCircle size={20} />
          เพิ่มใบเสร็จ
        </Link>
      </div>
      {receipts.length === 0 && <p className="text-gray-500">ไม่มีใบเสร็จรออนุมัติ</p>}
      {receipts.length > 0 && (
        <div className="overflow-x-auto border rounded-lg shadow-sm">
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100 whitespace-nowrap">
                <th className="p-2 border">วันที่</th>
                <th className="p-2 border">ผู้ใช้</th>
                <th className="p-2 border">เบอร์โทร</th>
                <th className="p-2 border">รูป</th>
                <th className="p-2 border">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((r) => {
                const ed = editing
                return (
                  <React.Fragment key={r.id}>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-2 border">{formatDate(r.createdAt)}</td>
                      <td className="p-2 border">{r.user?.name || "(ไม่มีข้อมูลผู้ใช้)"}</td>
                      <td className="p-2 border">{r.user?.phone || "-"}</td>
                      <td className="p-2 border text-center">
                        <Link href={r.fileUrl} target="_blank" rel="noreferrer" className="text-paseo font-semibold underline">
                          ดูรูป
                        </Link>
                      </td>
                      <td className="p-2 border text-center">
                        <button
                          className="px-3 py-1 bg-paseo text-white rounded-lg"
                          onClick={() => {
                            if (expandedReceiptId === r.id) {
                              setExpandedReceiptId(null)
                            } else {
                              setExpandedReceiptId(r.id)
                              if (r.userId) fetchUserHistory(r.userId)
                            }
                          }}
                        >
                          {expandedReceiptId === r.id ? "ปิด" : "ตรวจสอบ"}
                        </button>
                      </td>
                    </tr>
                    {expandedReceiptId === r.id && (
                      <tr>
                        <td colSpan={5} className="p-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            {/* receipt image */}
                            <div className="w-full">
                              {r.fileType === "IMAGE" ? (
                                <Image
                                  src={r.fileUrl}
                                  alt={`receipt-${r.id}`}
                                  className="rounded border object-contain"
                                  width={800}
                                  height={1000}
                                  style={{ height: '1000px', width: '100%' }}
                                />
                              ) : (
                                <object
                                  data={r.fileUrl}
                                  type="application/pdf"
                                  className="w-full rounded border object-contain"
                                  style={{ height: '1000px', width: '100%' }}
                                >
                                  <p className="text-center text-gray-500">
                                    เบราว์เซอร์ไม่รองรับ preview PDF
                                    <Link href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                      เปิดไฟล์
                                    </Link>
                                  </p>
                                </object>
                              )}
                              <div className="text-xs text-gray-500 mt-1">ไฟล์ต้นฉบับ</div>
                            </div>
                            {/* editing form */}
                            <div className="w-full flex flex-col gap-3 bg-white p-4 rounded-xl shadow">
                              <label className="text-sm font-medium">เลขที่ใบเสร็จ</label>
                              <input
                                className="input"
                                value={ed.receiptNumber ?? ""}
                                onChange={(e) => {
                                  const value = e.target.value;

                                  setEditing((s) => ({
                                    ...s,
                                    receiptNumber: value,
                                  }));

                                  checkReceipt(value);
                                }}
                              />

                              <label className="text-sm font-medium">จำนวนเงิน</label>
                              <input
                                type="number"
                                className="input"
                                value={ed.amount ?? ""}
                                onChange={(e) => setEditing((s) => ({ ...s, amount: Number(e.target.value) }))}
                              />

                              <label className="text-sm font-medium">วันที่ในใบเสร็จ</label>
                              <input
                                type="date"
                                className="input"
                                value={ed.receiptDate ?? new Date().toISOString().split("T")[0]}
                                onChange={(e) =>
                                  setEditing((s) => ({ ...s, receiptDate: e.target.value }))
                                }
                              />

                              <label className="text-sm font-medium">เวลาในใบเสร็จ</label>
                              <input
                                type="time"
                                className="input"
                                value={ed.receiptTime ?? ""}
                                onChange={(e) =>
                                  setEditing((s) => ({ ...s, receiptTime: e.target.value }))
                                }
                              />

                              <label className="text-sm font-medium">เลือกร้าน / สาขา</label>
                              <input
                                className="input"
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
                                        ed.selectedShopId === s.id ? "bg-gray-100 border-l-4 border-paseo" : ""
                                      }`}
                                      onClick={() => setEditing((st) => ({ ...st, selectedShopId: s.id }))}
                                    >
                                      <span className="font-medium">{s.shopName}</span>
                                      <span className="text-gray-600">— {s.branchName}</span>
                                      {ed.selectedShopId === s.id && (
                                        <span className="text-paseo text-xs ml-2">✓ เลือกแล้ว</span>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-2 text-gray-500 text-center">ไม่พบร้านหรือสาขาที่ค้นหา</div>
                                )}
                              </div>
                              <div className="flex gap-2 mt-2 items-center">
                                <button
                                  className="px-4 py-2 bg-paseo text-white rounded-lg disabled:opacity-50"
                                  disabled={actionLoading}
                                  onClick={() => handleApprove(r.id)}
                                >
                                  อนุมัติ
                                </button>
                                <select
                                  defaultValue=""
                                  className="border rounded-lg px-4 py-2 bg-red-500 text-white"
                                  onChange={(e) => handleReject(r.id, e.target.value)}
                                >
                                  <option value="">ปฏิเสธ...</option>
                                  {REJECT_REASONS.map((rr) => (
                                    <option key={rr} value={rr}>{rr}</option>
                                  ))}
                                </select>
                                <button
                                  className="ml-auto px-4 py-2 text-sm rounded-lg border text-white bg-red-500"
                                  onClick={() => {
                                    setExpandedReceiptId(null)
                                    setEditing({})
                                  }}
                                >
                                  ปิด
                                </button>
                              </div>
                              <div className="text-xs text-gray-500 mt-2">
                                สถานะ: <strong>{r.status}</strong>{" "}
                                {r.rejectReason ? ` — เหตุผล: ${r.rejectReason}` : ""}
                              </div>
                              {/* user history */}
                              <div className="mt-6 border-t pt-4">
                                <h2 className="font-bold mb-2">📜 ประวัติการส่งใบเสร็จ</h2>
                                {userHistory[r.userId || ""] ? (
                                  <table className="w-full border text-xs">
                                    <thead>
                                      <tr className="bg-gray-100">
                                        <th className="border px-2 py-1">วันที่อัปโหลด</th>
                                        <th className="border px-2 py-1">เลขใบเสร็จ</th>
                                        <th className="border px-2 py-1">วันที่ใบเสร็จ</th>
                                        <th className="border px-2 py-1">เวลา</th>
                                        <th className="border px-2 py-1">ร้านค้า</th>
                                        <th className="border px-2 py-1">สาขา</th>
                                        <th className="border px-2 py-1">จำนวนเงิน</th>
                                        <th className="border px-2 py-1">สถานะ</th>
                                        <th className="border px-2 py-1">รูป</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {userHistory[r.userId || ""].map((h) => (
                                        <tr key={h.id}>
                                          <td className="border px-2 py-1">{formatDate(h.createdAt)}</td>

                                          <td className="border px-2 py-1">
                                            {(h as any).receiptNumber || "-"}
                                          </td>

                                          <td className="border px-2 py-1">
                                            {(h as any).receiptDate
                                              ? new Date((h as any).receiptDate).toLocaleDateString("th-TH")
                                              : "-"}
                                          </td>

                                          <td className="border px-2 py-1">
                                            {(h as any).receiptTime || "-"}
                                          </td>

                                          <td className="border px-2 py-1">{(h as any).shop?.name || "-"}</td>
                                          <td className="border px-2 py-1">{(h as any).branch?.name || "-"}</td>
                                          <td className="border px-2 py-1">{h.amount}</td>
                                          <td className="border px-2 py-1">{h.status}</td>
                                          <td className="border px-2 py-1">
                                            {h.fileUrl ? (
                                              <Link
                                                href={h.fileUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-500 underline"
                                              >
                                                {h.fileType === "IMAGE" ? "ดูรูป" : "ดู PDF"}
                                              </Link>
                                            ) : (
                                              <span className="text-gray-400">ไม่มีไฟล์</span>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <p>กำลังโหลดประวัติ...</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}