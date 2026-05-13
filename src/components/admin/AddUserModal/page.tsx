"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import ThaiAddressSelect from '@/components/address/ThaiAddressSelect'
import { format } from "date-fns"
import { th } from "date-fns/locale"
import FormField from '@/components/form/FormField'
import SimpleSelect from '@/components/form/SimpleSelect'
import OtpVerifyModal from "@/components/auth/OtpVerifyModal";


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
  address: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  branchId: string;
  referralCode: string;
  interests: string[];
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

  const [opendate, setOpenDate] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [phoneError, setPhoneError] = useState("");

  const [form, setForm] = useState<UserForm>({
    name: initialData?.name || "",
    dateOfBirth: initialData?.dateOfBirth?.split("T")[0] || "",
    gender: initialData?.gender || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    occupation: initialData?.occupation || "",
    residenceType: initialData?.residenceType || "",
    address: initialData?.address || "",
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
    if (!initialData) return;

    const dob = initialData.dateOfBirth
      ? new Date(initialData.dateOfBirth)
      : undefined;

    setForm((prev) => ({
      ...prev,
      name: initialData.name || "",
      dateOfBirth: dob ? format(dob, "yyyy-MM-dd") : "",
      gender: initialData.gender || "",
      phone: initialData.phone || "",
      email: initialData.email || "",
      occupation: initialData.occupation || "",
      residenceType: initialData.residenceType || "",
      address: initialData.address || "",
      subDistrict: initialData.subDistrict || "",
      district: initialData.district || "",
      province: initialData.province || "",
      postalCode: initialData.postalCode || "",
      branchId: initialData.branchId || "",
      referralCode: initialData.referralCode || "",
      interests: initialData.interests?.map((i: any) => i.id) || [],
      role: initialData.role || prev.role,
    }));

    // ⭐ สำคัญ: sync ให้ Calendar แสดงวันที่เดิม
    setDate(dob);

    // OTP ถือว่าผ่านแล้วถ้ามีเบอร์
    setIsOtpVerified(!!initialData.phone);
  }, [initialData]);

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    setForm({
      ...form,
      dateOfBirth: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
    })
  }

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

  const handleChange = async (e: any) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });

    if (name === "phone" && value.length === 10) {
      await checkDuplicate();
    }
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

    if (!/^0[689]\d{8}$/.test(form.phone)) {
      alert("กรุณากรอกเบอร์โทรให้ถูกต้อง");
      return;
    }

    // ✅ ตรวจเบอร์ก่อน
    const phoneCheck = await fetch(`/api/admin/users/check-phone?phone=${form.phone}`);
    const phoneData = await phoneCheck.json();

    if (!phoneCheck.ok) {
      alert(phoneData.error);
      return;
    }

    // ส่ง OTP
    const res = await fetch("/api/auth/register/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: form.phone
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "ส่ง OTP ไม่สำเร็จ");
      return;
    }

    setShowOtpModal(true);
    setCountdown(60);
  };


  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      alert("กรุณากรอก OTP 6 หลัก");
      return;
    }

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: form.phone,
        otp,
        purpose: "REGISTER",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "OTP ไม่ถูกต้อง");
      return;
    }

    setIsOtpVerified(true);
    setShowOtpModal(false);
    setOtp("");
  };

  const checkDuplicate = async () => {
    const res = await fetch("/api/users/check-duplicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        phone: userType === "USER" ? form.phone : undefined,
        excludeUserId: isEdit ? initialData?.id : undefined,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setPhoneError(data.error);
      return false;
    }

    setPhoneError("");
    return true;
  };

  const handleSubmit = async () => {
    if (userType === "USER" && !isOtpVerified) {
      alert("กรุณายืนยัน OTP ก่อนบันทึกข้อมูล");
      return;
    }

    try {
      const baseUrl =
        userType === "ADMIN"
          ? "/api/admin/users/admin"
          : "/api/admin/users/customer";

      const url =
        mode === "edit"
          ? `${baseUrl}/${initialData?.id}`
          : baseUrl;

      const method = mode === "edit" ? "PATCH" : "POST";

      const payload: any = {
        ...form,
        name: `${form.name}`,
        role: userType === "ADMIN" ? form.role : "USER",
      };

      if (!payload.password) {
        delete payload.password;
      }

      if (!(await checkDuplicate())) return;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
          <OtpVerifyModal
            open={showOtpModal}
            phone={form.phone}
            onClose={() => setShowOtpModal(false)}
            onVerified={() => {
              setIsOtpVerified(true);
              setShowOtpModal(false);
            }}
          />
        )}

        <form className="flex flex-col gap-1">
          {userType === "ADMIN" ? (
            <>
              
              <div className='flex flex-row gap-2'>
                  <FormField label="ชื่อ" required>
                    <Input
                      type="text"
                      placeholder="ชื่อ"
                      name="firstName"
                      className="w-full pt-6 pb-4 pl-2 pr-4 border rounded-xl bg-white focus:outline-none focus:ring focus:ring-paseo text-xs"
                      onChange={handleChange}
                      value={form.name}
                      required
                    />
                  </FormField>
                </div>
                <FormField label="อีเมล" required>
                  <Input
                    type="email"
                    placeholder="อีเมล"
                    name="email"
                    className="w-full pt-6 pb-4 pl-2 pr-4 border rounded-xl bg-white focus:outline-none focus:ring focus:ring-paseo text-xs"
                    onChange={handleChange}
                    value={form.email}
                    required
                  />
                </FormField>

                <FormField
                  label={isEdit ? "รหัสผ่านใหม่ (ถ้าไม่แก้ ปล่อยว่าง)" : "รหัสผ่าน"}
                  required={!isEdit}
                >
                  <Input
                    type="password"
                    placeholder={isEdit ? "••••••••" : "รหัสผ่าน"}
                    name="password"
                    className="w-full pt-6 pb-4 pl-2 pr-4 border rounded-xl bg-white focus:outline-none focus:ring focus:ring-paseo text-xs"
                    onChange={handleChange}
                    value={form.password}
                  />
                </FormField>

                <FormField label="Role" required>
                  <SimpleSelect
                    value={form.role}
                    onChange={(v) => setForm({ ...form, role: v })}
                    options={[
                      { value: 'ADMIN', label: 'ADMIN' },
                      { value: 'ADMINMARKETING', label: 'ADMINMARKETING' },
                      { value: 'CRMMANAGEMENT', label: 'CRMMANAGEMENT' },
                      { value: 'STAFF', label: 'STAFF' },
                    ]}
                  >
                  </SimpleSelect>
                </FormField>
            </>
            
          ) : (
            <>
              <div className='flex flex-row gap-1'>
                <FormField label="ชื่อ" required>
                  <Input
                    type="text"
                    placeholder="ชื่อ"
                    name="firstName"
                    className="w-full pt-6 pb-4 pl-2 pr-4 border rounded-xl bg-white focus:outline-none focus:ring focus:ring-paseo text-xs"
                    onChange={handleChange}
                    value={form.name}
                    required
                  />
                </FormField>
              </div>

              <div className='flex flex-row gap-2'>
                <FormField label="วันเกิด" required>
                  <Popover open={opendate} onOpenChange={setOpenDate}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={`w-full justify-between rounded-xl bg-white focus:outline-none focus:ring focus:ring-paseo text-xs font-normal pt-6 pb-4 border ${!date ? "text-gray-400" : ""}`}>
                        {date ? format(date, "dd MMMM yyyy", { locale: th }) : "เลือกวันเกิด"}
                        <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 bg-white" align="start">
                      <Calendar
                        className='w-80'
                        mode="single"
                        captionLayout="dropdown"
                        selected={date}
                        onSelect={handleDateChange}
                        fromYear={1950}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                </FormField>

                <FormField label="เพศ" required>
                  <SimpleSelect
                    value={form.gender}
                    placeholder="เลือกเพศ"
                    onChange={(v) => setForm({ ...form, gender: v })}
                    options={[
                      { value: 'MALE', label: 'ชาย' },
                      { value: 'FEMALE', label: 'หญิง' },
                      { value: 'OTHER', label: 'อื่นๆ' },
                    ]}
                  />
                </FormField>
              </div>

              
              <div className="flex gap-2 items-center">
                <FormField label="เบอร์โทรศัพท์" required>
                  <Input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="เบอร์โทรศัพท์"
                    className="w-full pt-6 pb-4 pl-2 pr-4 border rounded-xl"
                  />

                  {phoneError && (
                    <p className="text-red-500 text-xs mt-1">
                      {phoneError}
                    </p>
                  )}
                </FormField>
                {!isOtpVerified && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="w-40 px-4 py-2 bg-paseo text-white rounded-lg"
                  >
                    ส่ง OTP
                  </button>
                )}
                {isOtpVerified && (
                  <span className="bg-paseo-hover border border-paseo-dark rounded-lg w-40 px-4 py-2 text-black text-xs flex items-center">
                    ✅ ยืนยันแล้ว
                  </span>
                )}
              </div>
              <FormField label="อีเมล" required>
                  <Input
                    type="email"
                    placeholder="อีเมล"
                    name="email"
                    className="w-full pt-6 pb-4 pl-2 pr-4 border rounded-xl bg-white focus:outline-none focus:ring focus:ring-paseo text-xs"
                    onChange={handleChange}
                    value={form.email}
                    required
                  />
                </FormField>
              <FormField label="สาขาที่สมัคร" required>
                  <SimpleSelect
                    value={form.branchId}
                    placeholder="เลือกสาขา"
                    onChange={(v) => setForm({ ...form, branchId: v })}
                    options={branches.map((b) => ({
                      value: b.id,
                      label: b.name,
                    }))}
                  />
                </FormField>

                <FormField label="อาชีพ" required>
                  <SimpleSelect
                    value={form.occupation}
                    placeholder="เลือกอาชีพ"
                    onChange={(v) => setForm({ ...form, occupation: v })}
                    options={[
                      { value: 'STUDENT', label: 'นักศึกษา' },
                      { value: 'PRIVATE_EMPLOYEE', label: 'พนักงานเอกชน' },
                      { value: 'STATE_ENTERPRISE', label: 'พนักงานรัฐวิสาหกิจ' },
                      { value: 'FREELANCER', label: 'อาชีพอิสระ' },
                      { value: 'BUSINESS_OWNER', label: 'เจ้าของกิจการ' },
                      { value: 'HOMEMAKER', label: 'พ่อบ้าน - แม่บ้าน' },
                      { value: 'OTHER', label: 'อื่นๆ' },
                    ]}
                  />
                </FormField>

                <FormField label="ประเภทที่อยู่" required>
                  <SimpleSelect
                    value={form.residenceType}
                    placeholder="เลือกประเภทที่อยู่"
                    onChange={(v) => setForm({ ...form, residenceType: v })}
                    options={[
                      { value: 'TOWNHOUSE', label: 'ทาวน์เฮาส์' },
                      { value: 'CONDO', label: 'คอนโด' },
                      { value: 'SINGLE_HOUSE', label: 'บ้านเดี่ยว' },
                    ]}
                  />
                </FormField>

              <FormField label="ที่อยู่" required>
                  <Input
                    name="address"
                    placeholder="ที่อยู่"
                    className="w-full pt-6 pb-4 pl-2 pr-4 border rounded-xl bg-white focus:outline-none focus:ring focus:ring-paseo text-xs"
                    onChange={handleChange}
                    value={form.address}
                  />
                </FormField>

              <ThaiAddressSelect
                value={{
                  province: form.province,
                  district: form.district,
                  subDistrict: form.subDistrict,
                  postalCode: form.postalCode,
                }}
                onChange={(addr) =>
                  setForm((f) => ({
                    ...f,
                    ...addr,
                  }))
                }
              />
              
              
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
