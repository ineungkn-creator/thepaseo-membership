"use client";
import { useState, useEffect } from "react";
import { FaSave } from "react-icons/fa";

export default function GeneralPointSetting() {
  const [form, setForm] = useState({
    signupPoints: 0,
    referralPoints: 0,
    receiptRateAmount: 100,
    receiptRatePoints: 1,
    pointExpireYears: 1
  });

  useEffect(() => {
    fetch("/api/admin/points/general_setting")
      .then(res => res.json())
      .then(data => setForm(prev => data || prev));
  }, []);

  const handleSave = async () => {
    const res = await fetch("/api/admin/points/general_setting", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (res.ok) alert("Settings updated!");
    else alert("Failed to update");
  };

  return (
    <div className="bg-white p-4 rounded-lg flex flex-col gap-4">
        <div className="">
            <h1>General Point Settings</h1>
        </div>

        <div className="w-full mb-4 flex flex-row gap-2">
            <label className="w-2/6 md:w-1/6">สมัครสมาชิก</label>
            <input
            className="w-4/6 md:w-5/6 pt-2 pb-2 pl-4 pr-4 border rounded-full"
            type="number"
            value={form.signupPoints}
            onChange={(e) => setForm({ ...form, signupPoints: +e.target.value })}
            />
        </div>

        <div className="w-full mb-4 flex flex-row gap-2">
            <label className="w-2/6 md:w-1/6">Referral</label>
            <input
            className="w-4/6 md:w-5/6 pt-2 pb-2 pl-4 pr-4 border rounded-full"
            type="number"
            value={form.referralPoints}
            onChange={(e) => setForm({ ...form, referralPoints: +e.target.value })}
            />
        </div>

        <div className="w-full mb-4 flex flex-row gap-2">
            <label className="w-2/6 md:w-1/6">Receipts</label>
            <input
            className="w-1/6 md:w-2/6 pt-2 pb-2 pl-4 pr-4 border rounded-full"
            type="number"
            value={form.receiptRateAmount}
            onChange={(e) => setForm({ ...form, receiptRateAmount: +e.target.value })}
            />
            บาท = 
            <input
            className="w-1/6 md:w-2/6 pt-2 pb-2 pl-4 pr-4 border rounded-full"
            type="number"
            value={form.receiptRatePoints}
            onChange={(e) => setForm({ ...form, receiptRatePoints: +e.target.value })}
            />
            พ้อย
        </div>

        <div className="w-full mb-4 flex flex-row gap-2">
            <label className="w-2/6 md:w-1/6">วันหมดอายุ</label>
            <input
            className="w-4/6 md:w-5/6 pt-2 pb-2 pl-4 pr-4 border rounded-full"
            type="number"
            value={form.pointExpireYears}
            onChange={(e) => setForm({ ...form, pointExpireYears: +e.target.value })}
            />
        </div>

        <div className="w-full flex flex-row justify-end">
            <button 
                className="flex items-center justify-center gap-2 text-white px-4 py-2 rounded-full disabled:opacity-50" style={{ backgroundColor: '#9DC93C' }}
                onClick={handleSave}>
                <FaSave /> Save
            </button>
        </div>
    </div>
  );
}
