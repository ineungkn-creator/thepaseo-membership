"use client"

import { useEffect, useState } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import Image from 'next/image';
import React from 'react';
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import BannerRegister from "@/components/BannerRegister/page"
import HeaderMobile from '@/components/HeaderMobile/page';

import SimpleSelect from '@/components/form/SimpleSelect'
import FormField from '@/components/form/FormField'
import ThaiAddressSelect from '@/components/address/ThaiAddressSelect'

import { FaSave } from "react-icons/fa";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";

interface Interest {
  id: string;
  name: string;
}

type FormState = {
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
}

export default function CompleteProfilePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [branches, setBranches] = useState<{ id: string; name: string; type: string }[]>([]);
  const [originalPhone, setOriginalPhone] = useState<string>("")
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otp, setOtp] = useState("")
  const [otpError, setOtpError] = useState("")
  const [isPhoneVerified, setIsPhoneVerified] = useState(true)
  const [interests, setInterests] = useState<Interest[]>([]);
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>({
    dateOfBirth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    subDistrict: "",
    district: "",
    province: "",
    postalCode: "",
    branchId: "",
    occupation: "",
    residenceType: "",
    referralCode: "",
    interests: [],
  })
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const thaiPhoneRegex = /^0[689]\d{8}$/
  const stepNames = ['ข้อมูลส่วนตัว', 'ที่อยู่', 'ข้อมูลเพิ่มเติม']

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch("/api/branch");
        if (!res.ok) throw new Error("โหลดสาขาไม่สำเร็จ");
        const data = await res.json();
        setBranches(data);
      } catch (error) {
        console.error("โหลดสาขาไม่สำเร็จ:", error);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (res.ok && data.user) {
          setForm((prev) => ({
            ...prev,
            dateOfBirth: data.user.dateOfBirth || prev.dateOfBirth,
            gender: data.user.gender || prev.gender,
            phone: data.user.phone || prev.phone,
            email: data.user.email || prev.email,
            address: data.user.address || prev.address,
            subDistrict: data.user.subDistrict || prev.subDistrict,
            district: data.user.district || prev.district,
            province: data.user.province || prev.province,
            postalCode: data.user.postalCode || prev.postalCode,
            branchId: data.user.branchId || prev.branchId,
            occupation: data.user.occupation || prev.occupation,
            residenceType: data.user.residenceType || prev.residenceType,
            interests: data.user.interests
            ? data.user.interests.map((i: any) => i.id)
            : [],
          }));
          if (data.user.dateOfBirth) setDate(new Date(data.user.dateOfBirth));
          if (data.user.phone) {
            setOriginalPhone(data.user.phone)
            setIsPhoneVerified(true)
          }
        }
      } catch (err) {
        console.error("โหลดข้อมูล profile ล้มเหลว", err);
      }
    };
    loadProfile();
  }, [session]);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const res = await fetch("/api/admin/interest");
        if (!res.ok) throw new Error("โหลดความสนใจไม่สำเร็จ");
        const data = await res.json();
        setInterests(data);
      } catch (error) {
        console.error("Error fetching interests:", error);
      }
    };
    fetchInterests();
  }, []);

  const toggleInterest = (id: string) => {
    setForm({
      ...form,
      interests: form.interests.includes(id)
        ? form.interests.filter((x) => x !== id)
        : [...form.interests, id],
    });
  };

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setForm({
      ...form,
      dateOfBirth: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "phone" && !thaiPhoneRegex.test(value)) {
      setError("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (เช่น 0812345678)");
    } else {
      setError("");
    }
  };

  const handleNextStep = async () => {
    setError("")

    // step 1 → ตรวจ phone
    if (step === 1) {
      if (!thaiPhoneRegex.test(form.phone)) {
        setError("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง")
        return
      }

      // ถ้าเบอร์เปลี่ยน → ต้อง OTP
      if (form.phone !== originalPhone && !isPhoneVerified) {
        const res = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: form.phone,
            purpose: "VERIFY_PHONE",
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          setError(data.error || "ไม่สามารถส่ง OTP ได้")
          return
        }

        setShowOtpModal(true)
        return
      }
    }

    setStep(step + 1)
  }

  const handlePrevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.interests.length) {
      setError('กรุณาเลือกความสนใจอย่างน้อยหนึ่งอย่าง');
      return;
    }

    if (form.phone !== originalPhone && !isPhoneVerified) {
      setError("กรุณายืนยันเบอร์โทรศัพท์ก่อนบันทึกข้อมูล")
      return
    }

    try {
      const res = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        router.push('/profile');
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  return (
    <div className="max-w-lg mx-auto md:py-6 py-4 pb-0 rounded-xl relative">

        <div className="fixed inset-x-0 top-0 overflow-hidden pt-2 pb-2 md:hidden z-50 blur2 rounded-b-xl shadow-sm border border-gray-200 flex flex-col">
          <div className="relative flex flex-row justify-center">

            <div className="flex flex-row justify-center gap-2 h-min">
              <Image
                src="/logo.png"
                alt="Thepaseo"
                width={40}
                height={40}
                unoptimized
              />
            </div>
    
          </div>
        </div>

        <div className="md:pt-4 pt-10 mb-0 py-4 px-4 md:px-4">
          <BannerRegister />
        </div>

        <div className="md:p-10 p-4 m-0 md:mb-20 rounded-3xl bg-white shadow z-50 relative">
          <div className="flex justify-center items-center gap-4 mb-5">
            <Image src="/logo-paseo-register.png" width={54} height={54} alt="ThePaseo" />
            <h2 className="text-xl font-semibold text-center">ข้อมูลเพิ่มเติม</h2>
          </div>

          {/* Stepper */}
          <div className="flex justify-center items-center mb-8">
            {stepNames.map((name, index) => (
              <div key={index} className="flex flex-col flex-auto items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
                    ${step > index + 1 ? 'text-white' : ''}
                    ${step === index + 1 ? 'text-white font-bold' : ''}
                    ${step < index + 1 ? 'text-gray-600' : ''}`}
                  style={
                    step > index + 1 ? { backgroundColor: '#9DC93C' } :
                    step === index + 1 ? { backgroundColor: '#688e22' } :
                    { backgroundColor: '#ddd' }
                  }
                >
                  {step > index + 1 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className={`text-sm font-medium ${step === index + 1 ? 'text-black-600' : 'text-gray-500'}`}>
                  {name}
                </div>
                {index < stepNames.length - 1 && (
                  <div className={`ml-3 flex-1 h-1 rounded-full ${step > index + 1 ? 'bg-color-paseo' : 'bg-gray-300'}`}></div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="flex flex-col gap-0 pb-10">
                <div className='flex flex-row gap-2'>
                  <FormField label="วันเกิด" required>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-between rounded-xl bg-gray-100 font-normal pt-10 pb-4 ${
                            !date ? 'text-gray-400' : ''
                          }`}
                        >
                          {date
                            ? format(date, 'dd MMMM yyyy', { locale: th })
                            : 'เลือกวันเกิด'}
                          <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 bg-white" align="start">
                        <Calendar
                          className="w-80"
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
                      onChange={(value) => setForm({ ...form, gender: value })}
                      options={[
                        { value: 'MALE', label: 'ชาย' },
                        { value: 'FEMALE', label: 'หญิง' },
                        { value: 'OTHER', label: 'อื่นๆ' },
                      ]}
                    />
                  </FormField>
                </div>

                <FormField label="เบอร์โทรศัพท์" required>
                  <Input
                    type="text"
                    placeholder="เบอร์โทรศัพท์ (เช่น 0812345678)"
                    name="phone"
                    onChange={handleChange}
                    className="w-full pt-10 pb-4 pl-2 pr-4 border rounded-xl text-black bg-white-100 focus:outline-none focus:ring focus:ring-paseo"
                    value={form.phone}
                    required
                  />
                  {error.includes("เบอร์โทร") && <p className="text-red-500 text-sm">{error}</p>}
                </FormField>

                

                <FormField label="อีเมล" required>
                  <Input
                    disabled
                    type="email"
                    placeholder="อีเมล *"
                    name="email"
                    className="w-full pt-10 pb-4 pl-2 pr-4 border rounded-xl text-gray-400 bg-gray-100 focus:outline-none focus:ring focus:ring-paseo"
                    value={form.email}
                    required
                  />
                </FormField>

                <FormField label="อาชีพ" required>
                  <SimpleSelect
                    value={form.occupation}
                    placeholder="อาชีพ *"
                    onChange={(value) => setForm({ ...form, occupation: value })}
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

                <FormField label="สาขาที่ทำการสมัคร" required>
                  <SimpleSelect
                    value={form.branchId}
                    placeholder="เลือกสาขาที่ทำการสมัคร *"
                    onChange={(value) => setForm({ ...form, branchId: value })}
                    options={branches.map((b) => ({
                      value: b.id,
                      label: b.name,
                    }))}
                  />
                </FormField>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-0 pb-20">
                <FormField label="ที่อยู่" required>
                  <SimpleSelect
                    value={form.residenceType}
                    placeholder="ที่อยู่ *"
                    onChange={(value) => setForm({ ...form, residenceType: value })}
                    options={[
                      { value: 'TOWNHOUSE', label: 'ทาวน์เฮาส์' },
                      { value: 'CONDO', label: 'คอนโด' },
                      { value: 'SINGLE_HOUSE', label: 'บ้านเดี่ยว' },
                    ]}
                  />
                </FormField>

                <FormField label="ที่อยู่" required>
                  <Input
                    type="text"
                    placeholder="ที่อยู่ *"
                    name="address"
                    className="w-full pt-10 pb-4 pl-2 pr-4 border rounded-xl bg-gray-100 focus:outline-none focus:ring focus:ring-paseo"
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    value={form.address}
                  />
                </FormField>

                {/* <FormField label="บ้านเลขที่" required>
                  <Input
                    type="text"
                    placeholder="บ้านเลขที่ *"
                    name="houseNumber"
                    className="w-full pt-10 pb-4 pl-2 pr-4 border rounded-xl bg-gray-100 focus:outline-none focus:ring focus:ring-paseo"
                    onChange={(e) => setForm({ ...form, houseNumber: e.target.value })}
                    value={form.houseNumber}
                  />
                </FormField>
    
                <FormField label="ซอย" required>
                  <Input
                    type="text"
                    placeholder="ซอย *"
                    name="alley"
                    className="w-full pt-10 pb-4 pl-2 pr-4 border rounded-xl bg-gray-100 focus:outline-none focus:ring focus:ring-paseo"
                    onChange={(e) => setForm({ ...form, alley: e.target.value })}
                    value={form.alley}
                  />
                </FormField> */}
    
                <ThaiAddressSelect
                  value={{
                    province: form.province,
                    district: form.district,
                    subDistrict: form.subDistrict,
                    postalCode: form.postalCode,
                  }}
                  onChange={(addr) =>
                    setForm(f => ({
                      ...f,
                      ...addr,
                    }))
                  }
                />
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4 pb-10">
                <Input name="referralCode" placeholder="รหัสผู้แนะนำ (ถ้ามี)" onChange={handleChange} value={form.referralCode} />
                <p className="font-semibold mb-2 mt-4">ความสนใจ</p>
                <div className="flex flex-wrap gap-2">
                  {interests.map((i) => {
                    const selected = form.interests.includes(i.id);
                    return (
                      <Badge
                        key={i.id}
                        onClick={() => toggleInterest(i.id)}
                        className={cn(
                          "cursor-pointer rounded-full px-3 py-1 text-sm transition",
                          selected
                            ? "bg-paseo text-white hover:bg-paseo-hover"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                      >
                        {i.name}
                      </Badge>
                    );
                  })}
                </div>
                {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
              </div>
            )}

            

            <div className="md:relative fixed bottom-0 left-0 px-4 py-2 w-full flex justify-between items-center blur rounded-t-xl shadow-lg md:shadow-none border md:border-none md:mt-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-40% text-sm text-white px-2 pl-4 py-2 rounded-full flex flex-row gap-2 items-center justify-between shadow bg-paseo-dark shadow"
                >
                  ย้อนกลับ
                  <FaArrowLeft color="#000" className="bg-white rounded-full p-1" size={24} />
                </button>
              ) : <div className="invisible"></div>}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                 className="w-40% text-sm text-white px-2 pr-4 py-2 rounded-full flex flex-row gap-2 items-center justify-between shadow bg-paseo shadow"
                >
                  <FaArrowRight color="#000" className="bg-white rounded-full p-1" size={24} />
                  ถัดไป
                </button>
              ) : (
                <button
                  type="submit"
                  className="w-40% text-sm text-white px-2 pr-4 py-2 rounded-full flex flex-row gap-2 items-center justify-between shadow bg-paseo shadow"
                >
                  <FaSave color="#000" className="bg-white rounded-full p-1" size={24} />
                  บันทึก
                </button>
              )}
            </div>
          </form>

          {showOtpModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
                      style={{ backdropFilter: "blur(2px)" }}
                    >
              <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm">
                <h3 className="text-lg font-semibold mb-2 text-center">
                  ยืนยันเบอร์โทรศัพท์
                </h3>

                <p className="text-sm text-gray-600 text-center mb-4">
                  ส่งรหัส OTP ไปที่ <strong>{form.phone}</strong>
                </p>

                <Input
                  placeholder="กรอกรหัส OTP"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value)
                    setOtpError("")
                  }}
                />

                {otpError && (
                  <p className="text-red-500 text-sm mt-2 text-center">{otpError}</p>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowOtpModal(false)}
                  >
                    ยกเลิก
                  </Button>

                  <Button
                    className="w-full"
                    onClick={async () => {
                      const res = await fetch("/api/auth/verify-otp", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          phone: form.phone,
                          otp,
                          purpose: "VERIFY_PHONE",
                        }),
                      })

                      const data = await res.json()

                      if (!res.ok) {
                        setOtpError(data.error || "OTP ไม่ถูกต้อง")
                        return
                      }

                      setIsPhoneVerified(true)
                      setShowOtpModal(false)
                      setStep(step + 1)
                    }}
                  >
                    ยืนยัน OTP
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  )
}
