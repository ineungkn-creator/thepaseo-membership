'use client'

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import RichTextEditor from "@/components/RichTextEditor/page";

export default function HelpForm({
  initialData,
  onClose,
  onSaved
}: {
  initialData?: any;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [question, setQuestion] = useState(initialData?.question || "");
  const [answer, setAnswer] = useState(initialData?.answer || "");
  const [order, setOrder] = useState(initialData?.order || 0);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const method = initialData ? "PATCH" : "POST";
    const body = { id: initialData?.id, question, answer, order, isActive };

    await fetch("/api/admin/help", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);
    onSaved();
    onClose();
  };

  return (
    <div className="space-y-4">
        <h1 className="text-2xl font-bold">เพิ่มคำถามใหม่</h1>

        <div className="sm:col-span-3">
            <Label className="block text-sm/6 font-medium text-gray-900">คำถาม / หัวข้อ</Label>
            <div className="mt-2">
                <Input className="input" value={question} onChange={(e) => setQuestion(e.target.value)} />
            </div>
        </div>

        <div className="sm:col-span-3">
            <Label className="block text-sm/6 font-medium text-gray-900">รายละเอียด / คำตอบ</Label>
            <div className="mt-2">
                <RichTextEditor value={answer} onChange={setAnswer} />
            </div>
        </div>

        <div className="sm:col-span-3">
            <Label>ลำดับการแสดง (order)</Label>
            <div className="mt-2">
                <Input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="input"
                />
            </div>
        </div>

        <div className="sm:col-span-3">
            <Label>สถานะการใช้งาน</Label>
            <div className="flex items-center space-x-2">
                <Checkbox checked={isActive} onCheckedChange={setIsActive} />
                <span className="block text-sm/6 font-medium text-gray-900">{isActive ? "เปิดใช้งาน" : "ปิด"}</span>
            </div>
        </div>

        <div className="sm:col-span-3 flex flex-row gap-4">
            <Button className="bg-paseo" onClick={handleSubmit} disabled={loading}>
            {loading ? "กำลังบันทึก..." : "บันทึก"}
            </Button>

            <Button className="bg-red-500 text-white" variant="outline" onClick={onClose}>ยกเลิก</Button>
            
        </div>
    </div>
    );
}
