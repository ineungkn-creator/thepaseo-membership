"use client";

import { useEffect, useState, useCallback } from "react";

type UserPoint = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  point: number;
};

type PointTransaction = {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description?: string;
  referenceId: string;
  referenceType: string;
  campaignId: string;
  shopId: string;
  branchId: string;
  shopName?: string;
  branchName?: string;
  createdAt: string;
  receiptStatus?: string;
};

export default function AdminPointPage() {
  const [users, setUsers] = useState<UserPoint[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState<UserPoint | null>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [filterType, setFilterType] = useState<string>("ALL");


  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/points?search=${search}&page=${page}`);
      const data = await res.json();
      setUsers(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, [search, page]); // ✅ memoize ด้วย dependency จริง

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const fetchTransactions = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/points/${userId}`);
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleSelectUser = (user: UserPoint) => {
    setSelectedUser(user);
    fetchTransactions(user.id);
  };

  return (
    <div className="flex w-full min-h-screen bg-white p-4 rounded-lg flex-1 mr-4 gap-4">
      {/* ซ้าย: รายชื่อ */}
      <div className="col-span-1">
        <h1 className="text-xl font-bold mb-4">ผู้ใช้ทั้งหมด</h1>
        <input
          type="text"
          placeholder="ค้นหาชื่อ, อีเมล, เบอร์โทร..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="input mb-2"
        />

        {loading ? (
          <p>กำลังโหลด...</p>
        ) : (
          <div className="overflow-y-auto max-h-[500px] border rounded-lg">
            <ul>
              {users.map((u) => (
                <li
                  key={u.id}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${
                    selectedUser?.id === u.id ? "bg-paseo-hover" : ""
                  }`}
                  onClick={() => handleSelectUser(u)}
                >
                  <div className="flex flex-row justify-between">
                    <p className="font-semibold">{u.name || "-"}</p>
                    <p className="text-sm text-paseo font-bold">
                    {u.point.toLocaleString()} พอยท์
                  </p>
                  </div>
                  
                  <p className="text-xs text-gray-500">{u.email}</p>
                  <p className="text-xs text-gray-500">{u.phone}</p>
                  
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pagination */}
        <div className="flex gap-4 mt-4 justify-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-4 py-1 border rounded ${
                p === page ? "bg-paseo text-white" : ""
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ขวา: ประวัติ */}
      <div className="w-full col-span-2 bg-white p-4 rounded shadow">
        {!selectedUser ? (
          <p className="text-gray-500">เลือกผู้ใช้เพื่อดูประวัติพ้อย</p>
        ) : (
          <>
            <h2 className="text-lg font-bold mb-2">
              ประวัติพ้อยของ {selectedUser.name}
            </h2>
            <div className="overflow-x-auto border rounded-lg shadow-sm">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100 whitespace-nowrap">
                    <th className="px-2 py-1">วันที่</th>
                    <th className="px-2 py-1">รายละเอียด</th>
                    <th className="px-2 py-1">ร้าน / สาขา</th>
                    <th className="px-2 py-1">เปลี่ยนแปลง</th>
                    <th className="px-2 py-1">ยอดคงเหลือ</th>
                    <th className="px-2 py-1">จัดการพอยต์</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-gray-50">
                      <td className="px-2 py-1">{new Date(t.createdAt).toLocaleString()}</td>
                      <td className="px-2 py-1">{t.description || "-"}</td>
                      <td className="px-2 py-1">{t.shopName || "-"} / {t.branchName || "-"}</td>
                      <td
                        className={`px-2 py-1 text-right ${t.amount > 0 ? "text-paseo" : "text-red-600"}`}
                      >
                        {t.amount > 0 ? `+${t.amount}` : t.amount}
                      </td>
                      <td className="px-2 py-1 text-right">{t.balanceAfter.toLocaleString()}</td>

                      {t.referenceType === "RECEIPT" &&
                        t.amount > 0 &&
                        t.receiptStatus === "APPROVED" && ( 
                        <td className="px-2 py-1 text-center">
                          <button
                            className="text-sm text-red-600 underline"
                            onClick={async () => {
                              if (confirm(`ต้องการยกเลิกพอยท์ ${t.amount} จากใบเสร็จนี้หรือไม่?`)) {
                                const res = await fetch("/api/admin/points/revoke-receipt", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ receiptId: t.referenceId, reason: "ตรวจสอบใหม่" }),
                                });
                                if (res.ok) {
                                  alert("ยกเลิกพอยท์สำเร็จ");
                                  fetchTransactions(selectedUser.id);
                                } else {
                                  const err = await res.json();
                                  alert(`ล้มเหลว: ${err.error}`);
                                }
                              }
                            }}
                          >
                            ยกเลิกพอยท์
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
