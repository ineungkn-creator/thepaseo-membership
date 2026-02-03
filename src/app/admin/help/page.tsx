//app/admin/help
'use client'

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HelpForm from "./components/HelpForm";

import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { IoIosAddCircle } from "react-icons/io";

export default function AdminHelpPage() {
  const [helps, setHelps] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    const res = await fetch("/api/admin/help");
    const data = await res.json();
    // จัดเรียงให้แน่นอน (order asc)
    data.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
    setHelps(data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบหัวข้อนี้ใช่หรือไม่?")) return;
    await fetch(`/api/admin/help/${id}`, { method: "DELETE" });
    setHelps(prev => prev.filter(p => p.id !== id));
  };

  const handleEdit = (item: any) => {
    setSelected(item);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelected(null);
    setIsFormOpen(true);
  };

  const move = (indexFrom: number, indexTo: number) => {
    if (indexFrom < 0 || indexTo < 0 || indexTo >= helps.length) return;
    const arr = [...helps];
    [arr[indexFrom], arr[indexTo]] = [arr[indexTo], arr[indexFrom]];
    // after swap, update local order values (0..n-1)
    const updated = arr.map((item, idx) => ({ ...item, order: idx }));
    setHelps(updated);
    // call API to persist order
    persistOrder(updated);
  };

  const persistOrder = async (updated: any[]) => {
    const bannerOrder = updated.map(h => ({ id: h.id, order: h.order }));
    await fetch("/api/admin/help/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bannerOrder }), // keep same shape as banner example
    });
  };

  return (
    <div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">จัดการ Help / FAQ</h1>
        <Button className="flex flex-row items-center gap-2 px-4 py-2 bg-paseo text-white rounded-lg" onClick={handleAdd}>
          <IoIosAddCircle size={20} />
          <span className="text-base">เพิ่มหัวข้อ</span>
        </Button>
      </div>

      {isFormOpen && (
        <Card className="p-4">
          <HelpForm
            initialData={selected}
            onClose={() => { setIsFormOpen(false); fetchList(); }}
            onSaved={() => { setIsFormOpen(false); fetchList(); }}
          />
        </Card>
      )}

      <div className="space-y-4 mt-4">
        {helps.map((p, idx) => (
          <Card key={p.id} className="bg-white flex justify-between gap-4 items-center p-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-2 mr-4">
                <Button size="sm" className="h-8 w-8 bg-paseo rounded-full" onClick={() => move(idx, idx - 1)} disabled={idx === 0}>
                  <FaArrowUp className="h-4 w-4" />
                </Button>
                <Button size="sm" className="h-8 w-8 bg-paseo rounded-full" onClick={() => move(idx, idx + 1)} disabled={idx === helps.length - 1}>
                  <FaArrowDown className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <h3 className="font-semibold">{p.question}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button className="bg-paseo" variant="outline" size="sm" onClick={() => handleEdit(p)}>
                แก้ไข
              </Button>
              <Button className="bg-red-500" variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>
                ลบ
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
