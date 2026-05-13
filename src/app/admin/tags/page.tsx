"use client";

import { useEffect, useState } from "react";
import { IoIosAddCircle } from "react-icons/io";

interface Tag {
  id: string;
  name: string;
  usage: number;
}

export default function TagManagementPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    loadTags();
  }, []);

  async function loadTags() {
    setLoading(true);
    const res = await fetch("/api/admin/tags");
    const data = await res.json();
    setTags(data);
    setLoading(false);
  }

  async function createTag() {
    if (!newName.trim()) return;

    await fetch("/api/admin/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });

    setNewName("");
    loadTags();
  }

  async function saveEdit() {
    if (!editTag) return;

    await fetch(`/api/admin/tags/${editTag.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });

    setEditTag(null);
    setNewName("");
    loadTags();
  }

  async function deleteTag(id: string) {
    if (!confirm("ลบแท็กนี้ ?")) return;

    await fetch(`/api/admin/tags/${id}`, {
      method: "DELETE",
    });

    loadTags();
  }

  const filtered = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white p-4 rounded-lg flex-1 mr-4">
        <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold mb-4">จัดการแท็ก</h1>
        </div>
      {/* Search */}
      <input
        type="text"
        placeholder="ค้นหาแท็ก..."
        className="input mb-2"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Create / Edit Form */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder={editTag ? "แก้ไขชื่อแท็ก" : "สร้างแท็กใหม่..."}
          className="input"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />

        {editTag ? (
          <button
            className="flex flex-row items-center gap-2 px-4 py-2 bg-paseo-dark text-white rounded-lg"
            onClick={saveEdit}
          >
            บันทึก
          </button>
        ) : (
          <button
            className="flex flex-row items-center gap-2 px-4 py-2 bg-paseo text-white rounded-lg"
            onClick={createTag}
          >
            <IoIosAddCircle size={20} />
            เพิ่มแท็ก
          </button>
        )}
      </div>

    <div className="overflow-x-auto border rounded-lg shadow-sm">
        {/* Tag List */}
        {loading ? (
            <p>กำลังโหลด...</p>
        ) : filtered.length === 0 ? (
            <p>ไม่มีแท็กที่ค้นหา</p>
        ) : (
            <table className="w-full border text-sm">
                <thead>
                    <tr className="bg-gray-100 whitespace-nowrap">
                        <th className="border px-3 py-2 text-center">ชื่อแท็ก</th>
                        <th className="border px-3 py-2 text-center">จำนวนที่ถูกใช้</th>
                        <th className="border px-3 py-2 text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((tag) => (
                    <tr key={tag.id} className="border-b hover:bg-gray-50">
                        <td className="border px-3 py-2 ">{tag.name}</td>
                        <td className="border px-3 py-2 text-center">{tag.usage}</td>
                        <td className="px-3 py-2 text-center flex justify-center gap-2">
                        <button
                            className="px-2 py-1 bg-paseo text-white rounded-lg"
                            onClick={() => {
                            setEditTag(tag);
                            setNewName(tag.name);
                            }}
                        >
                            แก้ไข
                        </button>
                        <button
                            className="px-2 py-1 bg-red-500 text-white rounded-lg"
                            onClick={() => deleteTag(tag.id)}
                        >
                            ลบ
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
           </table>
      )}
       </div>
    </div>
  );
}
