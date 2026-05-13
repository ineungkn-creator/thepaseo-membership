"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FaSearch } from "react-icons/fa";
import { IoIosAddCircle } from "react-icons/io";

import AddUserModal from "@/components/admin/AddUserModal/page";

interface User {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  branch?: {
    name: string;
  };
  referralCode?: string;
  createdAt: string;
}

export default function AdminCustomerPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [openAdd, setOpenAdd] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  // โหลด users
  const loadUsers = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/admin/users/customer?search=${search}`
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setUsers(data.users);
    } catch (err) {
      console.error(err);
      alert("โหลดข้อมูลสมาชิกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearch = () => {
    loadUsers();
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users/customer/${id}`);
      const text = await res.text();

        if (!res.ok) {
        console.error(text);
        alert("โหลดข้อมูลไม่สำเร็จ");
        return;
        }

        const data = JSON.parse(text);
        setEditUser(data);
    } catch (err) {
      console.error(err);
      alert("โหลดข้อมูลสมาชิกไม่สำเร็จ");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบสมาชิกคนนี้หรือไม่")) return;

    try {
      const res = await fetch(`/api/admin/users/customer/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      alert("ลบสมาชิกเรียบร้อย");
      loadUsers();
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถลบสมาชิกได้");
    }
  };

  const handleAddSuccess = () => {
    setOpenAdd(false);
    setEditUser(null);
    loadUsers();
  };

  return (
    <div className="flex w-full min-h-screen">
      <div className="bg-white p-6 rounded-lg flex-1">

        {/* Header */}
        <div className="flex justify-between mb-6">

          <h1 className="text-2xl font-bold">
            สมาชิก (Customers)
          </h1>

          <Button
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-2 bg-paseo text-white"
          >
            <IoIosAddCircle size={20} />
            เพิ่มสมาชิก
          </Button>

        </div>

        {/* Search */}
        <div className="flex gap-3 mb-6">

          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="ค้นหาชื่อ / เบอร์โทร"
              className="w-full pl-10 px-4 py-2 border rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />

            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          <Button
            onClick={handleSearch}
            className="bg-paseo text-white"
          >
            ค้นหา
          </Button>

        </div>

        {/* Table */}
        {loading ? (
          <p className="text-center text-gray-500">
            กำลังโหลดข้อมูล...
          </p>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-500">
            ไม่พบข้อมูลสมาชิก
          </p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">

              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">ชื่อ</th>
                  <th className="p-2 border">เบอร์โทร</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">สาขา</th>
                  <th className="p-2 border">Referral</th>
                  <th className="p-2 border">จัดการ</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-gray-50">

                    <td className="p-2 border">{u.name}</td>

                    <td className="p-2 border">
                      {u.phone || "-"}
                    </td>

                    <td className="p-2 border">
                      {u.email || "-"}
                    </td>

                    <td className="p-2 border">
                      {u.branch?.name || "-"}
                    </td>

                    <td className="p-2 border text-center">
                      {u.referralCode || "-"}
                    </td>

                    <td className="p-2 border text-center space-x-2">

                      <Button
                        onClick={() => handleEdit(u.id)}
                        className="bg-paseo text-white px-3 py-1"
                      >
                        แก้ไข
                      </Button>

                      <Button
                        onClick={() => handleDelete(u.id)}
                        className="bg-red-500 text-white px-3 py-1"
                      >
                        ลบ
                      </Button>

                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

        {/* Add/Edit Modal */}
        {(openAdd || editUser) && (
          <AddUserModal
            open={openAdd || !!editUser}
            onClose={() => {
              setOpenAdd(false);
              setEditUser(null);
            }}
            onSuccess={handleAddSuccess}
            mode={editUser ? "edit" : "add"}
            initialData={editUser || undefined}
            userType="USER"
          />
        )}
      </div>
    </div>
  );
}