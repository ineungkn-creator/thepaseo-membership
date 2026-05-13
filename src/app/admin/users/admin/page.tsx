"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FaSearch } from "react-icons/fa";
import { IoIosAddCircle } from "react-icons/io";
import AddUserModal from "@/components/admin/AddUserModal/page";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [openAdd, setOpenAdd] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);

  const loadUsers = async () => {
    try {

      setLoading(true);

      const res = await fetch("/api/admin/users/admin");

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      setUsers(data.admins || []);

    } catch (err) {
      console.error(err);
      alert("โหลดข้อมูลแอดมินไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleEdit = async (id: string) => {

    try {

      const res = await fetch(`/api/admin/users/admin/${id}`);

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      setEditUser(data);

    } catch (err) {
      console.error(err);
      alert("โหลดข้อมูลไม่สำเร็จ");
    }
  };

  const handleDelete = async (id: string) => {

    const password = prompt("กรุณากรอกรหัสผ่านแอดมินเพื่อยืนยัน");

    if (!password) return;

    try {

      const res = await fetch(`/api/admin/users/admin/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      alert("ลบผู้ดูแลระบบสำเร็จ");

      loadUsers();

    } catch (err) {
      console.error(err);
      alert("ไม่สามารถลบได้");
    }
  };

  const handleAddSuccess = () => {
    setOpenAdd(false);
    setEditUser(null);
    loadUsers();
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex w-full min-h-screen">

      <div className="bg-white p-6 rounded-lg flex-1">

        {/* HEADER */}
        <div className="flex justify-between mb-6">

          <h1 className="text-2xl font-bold">
            ผู้ดูแลระบบ (Admins)
          </h1>

          <Button
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-2 bg-paseo text-white"
          >
            <IoIosAddCircle size={20} />
            เพิ่มผู้ดูแลระบบ
          </Button>

        </div>

        {/* SEARCH */}
        <div className="flex gap-3 mb-6">

          <div className="relative w-full max-w-md">

            <input
              type="text"
              placeholder="ค้นหาชื่อ / email"
              className="w-full pl-10 px-4 py-2 border rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <FaSearch className="absolute left-3 top-3 text-gray-400" />

          </div>

        </div>

        {/* TABLE */}
        {loading ? (
          <p className="text-center text-gray-500">
            กำลังโหลดข้อมูล...
          </p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-center text-gray-500">
            ไม่พบข้อมูล
          </p>
        ) : (

          <div className="overflow-x-auto border rounded-lg">

            <table className="w-full text-sm">

              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">ชื่อ</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Role</th>
                  <th className="p-2 border">จัดการ</th>
                </tr>
              </thead>

              <tbody>

                {filteredUsers.map((u) => (

                  <tr key={u.id} className="border-b hover:bg-gray-50">

                    <td className="p-2 border">{u.name}</td>

                    <td className="p-2 border">
                      {u.email}
                    </td>

                    <td className="p-2 border text-center">
                      {u.role}
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

        {/* MODAL */}

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
            userType="ADMIN"
          />

        )}

      </div>

    </div>
  );
}