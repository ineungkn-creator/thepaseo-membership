'use client';

import { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

interface Interest {
  id: string;
  name: string;
}

export default function AdminInterestPage() {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState<Interest | null>(null);

  async function fetchInterests() {
    const res = await fetch('/api/admin/interest');
    const data = await res.json();
    setInterests(data);
  }

  useEffect(() => {
    fetchInterests();
  }, []);

  async function handleAdd() {
    if (!newName.trim()) return;
    await fetch('/api/admin/interest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    });
    setNewName('');
    fetchInterests();
  }

  async function handleUpdate() {
    if (!editing) return;
    await fetch(`/api/admin/interest/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editing.name }),
    });
    setEditing(null);
    fetchInterests();
  }

  async function handleDelete(id: string) {
    if (!confirm('คุณต้องการลบใช่ไหม?')) return;
    await fetch(`/api/admin/interest/${id}`, {
      method: 'DELETE',
    });
    fetchInterests();
  }

  return (
    <div className="bg-white md:p-10 p-4 space-y-4 rounded-lg flex-1 mr-4">
      <h1 className="text-xl font-bold mb-4">จัดการสิ่งที่สนใจ</h1>

      {/* Add new */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="เพิ่มสิ่งที่สนใจใหม่..."
          className="input"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button
          onClick={handleAdd}
          className="bg-paseo text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaPlus /> เพิ่ม
        </button>
      </div>

      {/* List */}
      <ul className="space-y-2">
        {interests.map((interest) => (
          <li
            key={interest.id}
            className="flex justify-between items-center border rounded-lg px-3 py-2"
          >
            {editing?.id === interest.id ? (
              <>
                <input
                  type="text"
                  className="border rounded-lg px-2 py-1 flex-1 mr-2"
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
                <button
                  onClick={handleUpdate}
                  className="bg-paseo text-white px-3 py-1 rounded-lg mr-2"
                >
                  บันทึก
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg"
                >
                  ยกเลิก
                </button>
              </>
            ) : (
              <>
                <span>{interest.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(interest)}
                    className="bg-paseo py-2 px-4 rounded-lg text-white"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(interest.id)}
                    className="bg-red-500 py-2 px-4 rounded-lg text-white"
                  >
                    <FaTrash />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
