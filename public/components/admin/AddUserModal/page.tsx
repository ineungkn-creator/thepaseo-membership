"use client";

import { useState, useEffect } from "react";

interface Branch {
  id: string;
  name: string;
}

interface Interest {
  id: string;
  name: string;
}

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "add" | "edit";
  userType: "USER" | "ADMIN";
  initialData?: any;
}

interface UserForm {
  name: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  occupation: string;
  residenceType: string;
  houseNumber: string;
  alley: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  branchId: string;
  referralCode: string;
  interests: string[]; // ✅ กำหนดชัดว่าเป็น array ของ string
  password: string;
  role: string;
}

export default function AddUserModal({
  open,
  onClose,
  onSuccess,
  mode,
  userType,
  initialData,
}: AddUserModalProps) {

  const isEdit = mode === "edit";
  const [branches, setBranches] = useState<Branch[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [form, setForm] = useState<UserForm>({
    name: initialData?.name || "",
    dateOfBirth: initialData?.dateOfBirth?.split("T")[0] || "",
    gender: initialData?.gender || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    occupation: initialData?.occupation || "",
    residenceType: initialData?.residenceType || "",
    houseNumber: initialData?.houseNumber || "",
    alley: initialData?.alley || "",
    subDistrict: initialData?.subDistrict || "",
    district: initialData?.district || "",
    province: initialData?.province || "",
    postalCode: initialData?.postalCode || "",
    branchId: initialData?.branchId || "",
    referralCode: initialData?.referralCode || "",
    interests: initialData?.interests?.map((i: any) => i.id) || [],
    password: "",
    role: initialData?.role || (userType === "ADMIN" ? "ADMIN" : "USER"),
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...form,
        name: initialData.name || "",
        dateOfBirth: initialData.dateOfBirth?.split("T")[0] || "",
        gender: initialData.gender || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        occupation: initialData.occupation || "",
        residenceType: initialData.residenceType || "",
        houseNumber: initialData.houseNumber || "",
        alley: initialData.alley || "",
        subDistrict: initialData.subDistrict || "",
        district: initialData.district || "",
        province: initialData.province || "",
        postalCode: initialData.postalCode || "",
        branchId: initialData.branchId || "",
        referralCode: initialData.referralCode || "",
        interests: initialData.interests?.map((i: any) => i.id) || [],
        role: initialData.role || form.role,
      });
      if (initialData.phone) setIsOtpVerified(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  useEffect(() => {
    const loadData = async () => {
      const [branchData, interestData] = await Promise.all([
        fetch("/api/branch").then((r) => r.json()),
        fetch("/api/admin/interest").then((r) => r.json()),
      ]);
      setBranches(branchData);
      setInterests(interestData);
    };
    loadData();
  }, []);

  if (!open) return null;

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleInterest = (id: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((x) => x !== id)
        : [...prev.interests, id],
    }));
  };

  // OTP
  const handleSendOtp = async () => {
    if (!/^0[689]\d{8}$/.test(form.phone)) return alert("กรุณากรอกเบอร์โทรให้ถูกต้อง");
    const res = await fetch("/api/admin/users/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: form.phone }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "ส่ง OTP ไม่สำเร็จ");
    setShowOtpModal(true);
    setCountdown(60);
  };

  const handleVerifyOtp = async () => {
    const res = await fetch("/api/admin/users/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: form.phone, otp }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "OTP ไม่ถูกต้อง");
    setIsOtpVerified(true);
    setShowOtpModal(false);
  };

  const handleSubmit = async () => {
    try {
      const url =
        mode === "edit" ? `/api/admin/users?id=${initialData?.id}` : "/api/admin/users";
      const method = mode === "edit" ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          role: userType === "ADMIN" ? form.role : "USER",
        }),
      });
      const data = await res.json();

      if (!res.ok) return alert(data.error || "บันทึกข้อมูลไม่สำเร็จ");

      alert(isEdit ? "✅ แก้ไขข้อมูลสำเร็จ" : "✅ เพิ่มผู้ใช้สำเร็จ");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
      style={{ backdropFilter: "blur(2px)" }}
    >
      <div className="bg-white w-full max-w-2xl rounded-md p-6 overflow-y-auto max-h-[95vh]">
        <h2 className="text-lg font-bold mb-4 text-center">
          {isEdit
            ? "แก้ไขข้อมูลผู้ใช้"
            : userType === "ADMIN"
            ? "เพิ่มแอดมิน"
            : "เพิ่มสมาชิกใหม่"}
        </h2>

        {/* OTP Modal */}
        {showOtpModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-md p-4 w-80 text-center">
              <h3 className="font-semibold mb-3">กรอกรหัส OTP</h3>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                className="border rounded p-2 w-full text-center tracking-widest"
              />
              <div className="mt-2 flex justify-between items-center text-sm">
                <button
                  disabled={countdown > 0}
                  onClick={handleSendOtp}
                  className="text-green-600 underline disabled:text-gray-400"
                >
                  {countdown > 0 ? `ขอ OTP อีกครั้ง (${countdown}s)` : "ขอ OTP ใหม่"}
                </button>
                <button
                  onClick={() => setShowOtpModal(false)}
                  className="text-gray-500 underline"
                >
                  ปิด
                </button>
              </div>
              <button
                onClick={handleVerifyOtp}
                className="bg-green-500 text-white w-full py-2 rounded mt-3"
              >
                ยืนยัน OTP
              </button>
            </div>
          </div>
        )}

        <form className="flex flex-col gap-3">
          {userType === "ADMIN" ? (
            <>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="ชื่อ"
                className="border rounded p-2"
              />
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                type="email"
                className="border rounded p-2"
              />
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="รหัสผ่าน"
                type="password"
                className="border rounded p-2"
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="border rounded p-2"
              >
                <option value="">เลือก Role</option>
                <option value="ADMIN">ADMIN</option>
                <option value="ADMINMARKETING">ADMINMARKETING</option>
                <option value="CRMMANAGEMENT">CRMMANAGEMENT</option>
                <option value="STAFF">STAFF</option>
              </select>
            </>
          ) : (
            <>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="border rounded p-2"
              >
                <option value="">เพศ</option>
                <option value="MALE">ชาย</option>
                <option value="FEMALE">หญิง</option>
                <option value="OTHER">อื่นๆ</option>
              </select>
              <div className="flex gap-2">
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={isOtpVerified}
                  placeholder="เบอร์โทรศัพท์"
                  className="border rounded p-2 flex-1"
                />
                {!isOtpVerified && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="px-4 py-2 bg-paseo text-white rounded-lg"
                  >
                    ส่ง OTP
                  </button>
                )}
                {isOtpVerified && (
                  <span className="text-green-600 text-sm flex items-center">
                    ✅ ยืนยันแล้ว
                  </span>
                )}
              </div>
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <select
                value={form.branchId}
                onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                className="border rounded p-2"
              >
                <option value="">เลือกสาขา</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <input
                name="houseNumber"
                placeholder="บ้านเลขที่"
                value={form.houseNumber}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <input
                name="district"
                placeholder="เขต/อำเภอ"
                value={form.district}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <input
                name="province"
                placeholder="จังหวัด"
                value={form.province}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <input
                name="postalCode"
                placeholder="รหัสไปรษณีย์"
                value={form.postalCode}
                onChange={handleChange}
                className="border rounded p-2"
              />
              <div>
                <label className="font-semibold block mb-1">ความสนใจ:</label>
                <div className="flex flex-wrap gap-2">
                  {interests.map((i) => (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => toggleInterest(i.id)}
                      className={`px-3 py-1 rounded border ${
                        form.interests.includes(i.id)
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {i.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </form>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-paseo text-white rounded-lg"
          >
            {isEdit ? "บันทึกการแก้ไข" : "บันทึกข้อมูล"}
          </button>
        </div>
      </div>
    </div>
  );
}
