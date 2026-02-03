'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, } from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import BannerRegister from "@/components/BannerRegister/page"
import HeaderMobile from '@/components/HeaderMobile/page';
import { signIn } from "next-auth/react"

import SimpleSelect from '@/components/form/SimpleSelect'
import FormField from '@/components/form/FormField'
import ThaiAddressSelect from '@/components/address/ThaiAddressSelect'


import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";

interface Interest {
  id: string;
  name: string;
}

type FormState = {
  firstName: string;
  lastName: string;
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

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [interests, setInterests] = useState<Interest[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string; type: string }[]>([]);
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [success, setSuccess] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)

  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    //houseNumber: '',
    //alley: '',
    subDistrict: '',
    district: '',
    province: '',
    postalCode: '',
    branchId: "",
    occupation: '',
    residenceType: "",
    referralCode: '',
    interests: [],
  })

  const stepNames = ['ข้อมูลส่วนตัว', 'ที่อยู่', 'ข้อมูลเพิ่มเติม']
  const thaiPhoneRegex = /^0[689]\d{8}$/

  const sendOtp = async () => {
    setError("")

    const res = await fetch("/api/auth/register/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: form.phone }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "ไม่สามารถส่ง OTP ได้")
      return false
    }

    setOtpSent(true)
    return true
  }

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "phone" && !thaiPhoneRegex.test(value)) {
      setError("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (เช่น 0812345678)");
    } else {
      setError("");
    }
  }

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    setForm({
      ...form,
      dateOfBirth: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
    })
  }

  const toggleInterest = (id: string) => {
    setForm({
      ...form,
      interests: form.interests.includes(id)
        ? form.interests.filter((x) => x !== id)
        : [...form.interests, id],
    });
  };

  const handlePrevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleNextStep = async () => {
    setError("")

    if (step === 1) {
      if (!thaiPhoneRegex.test(form.phone)) {
        setError("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง")
        return
      }

      // ✅ เช็คเบอร์ก่อน
      const check = await fetch("/api/auth/register/check-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone }),
      })

      const checkData = await check.json()

      if (!check.ok) {
        setError(checkData.error)
        return
      }

      // ✅ ค่อยส่ง OTP
      const otpOk = await sendOtp()
      if (!otpOk) return

      setShowOtpModal(true)
      return
    }

    setStep(step + 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!form.interests.length) {
      setError('กรุณาเลือกความสนใจอย่างน้อยหนึ่งอย่าง');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
        return;
      }

      // ⬇️ สมัครสำเร็จ → login ทันที โดยไม่ต้อง OTP
      const loginResult = await signIn("credentials", {
        redirect: false,
        phone: form.phone,
        bypassOtp: true,      // <—— flag บอกว่ามาจากการสมัคร
      });

      if (loginResult?.ok) {
        router.push("/");     // เข้าหน้าแรกของระบบทันที
      } else {
        router.push("/auth/login");
      }

    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการสมัครสมาชิก');
    }
  };

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  return (
    <div className="max-w-lg mx-auto md:py-6 py-4 pb-0 rounded-xl relative">

        <HeaderMobile showBack={false} />

        <div className="md:pt-4 pt-14 mb-0 py-4 px-4 md:px-4">
          <BannerRegister />
        </div>

        <div className="md:p-10 mb-10 p-4 rounded-3xl bg-white shadow z-50">
          <div className="flex justify-center items-center gap-4 mb-5">
            <Image src="/logo-paseo-register.png" width={54} height={54} alt="ThePaseo" />
            <h2 className="text-xl font-semibold text-center">สมัครสมาชิก</h2>
          </div>

          {/* Step Indicator */}
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
            {/* Step 1 */}
            {step === 1 && (
              <div className="flex flex-col gap-0">
                <div className='flex flex-row gap-2'>
                  <FormField label="ชื่อ" required>
                    <Input
                      type="text"
                      placeholder="ชื่อ"
                      name="firstName"
                      className="w-full pt-6 pb-4 pl-2 pr-4 border rounded-xl bg-white focus:outline-none focus:ring focus:ring-paseo"
                      onChange={handleChange}
                      value={form.firstName}
                      required
                    />
                  </FormField>
                  <FormField label="นามสกุล" required>
                    <Input
                      type="text"
                      placeholder="นามสกุล"
                      name="lastName"
                      className="w-full pt-6 pb-4 pl-2 pr-4 border rounded-xl bg-white focus:outline-none focus:ring focus:ring-paseo"
                      onChange={handleChange}
                      value={form.lastName}
                      required
                    />
                  </FormField>
                </div>

                <div className='flex flex-row gap-2'>
                  <FormField label="วันเกิด" required>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={`w-full justify-between rounded-xl bg-white focus:outline-none focus:ring focus:ring-paseo font-normal pt-6 pb-4 border ${!date ? "text-gray-400" : ""}`}>
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

                <FormField label="เบอร์โทรศัพท์" required>
                  <Input
                    type="tel"
                    placeholder="เบอร์โทรศัพท์ (เช่น 0812345678)"
                    name="phone"
                    className="w-full pt-6 pb-4 pl-2 pr-4 border rounded-xl bg-white focus:outline-none focus:ring focus:ring-paseo"
                    onChange={handleChange}
                    value={form.phone}
                    required
                  />
                </FormField>
                {error && error.includes("เบอร์โทร") && <p className="text-red-500 text-sm">{error}</p>}

                <FormField label="อีเมล" required>
                  <Input
                    type="email"
                    placeholder="อีเมล"
                    name="email"
                    className="w-full pt-6 pb-4 pl-2 pr-4 border rounded-xl bg-white focus:outline-none focus:ring focus:ring-paseo"
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
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="flex flex-col gap-0">
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
                    className="w-full pt-6 pb-4 pl-2 pr-4 border rounded-xl bg-white focus:outline-none focus:ring focus:ring-paseo"
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
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <>
                <Input name="referralCode" placeholder="รหัสผู้แนะนำ (ถ้ามี)" onChange={handleChange} value={form.referralCode} />
                <p className="font-semibold mb-2 mt-4">ความสนใจ</p>
                <div className="flex flex-wrap gap-2">
                  {interests.map((i) => {
                    const selected = form.interests.includes(i.id);
                    return (
                      <Badge
                        key={i.id}
                        onClick={() => toggleInterest(i.id)}
                        className={cn("cursor-pointer rounded-full px-3 py-1 text-sm transition",
                          selected
                            ? "bg-color-paseo text-white hover:bg-color-paseo-hover"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200")}
                      >
                        {i.name}
                      </Badge>
                    );
                  })}
                </div>
              </>
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
                <FaUser color="#000" className="bg-white rounded-full p-1" size={24} />
                  สมัครสมาชิก
                </button>
              )}
            </div>
          </form>

          {showOtpModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
            style={{ backdropFilter: "blur(2px)" }}
          >
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold text-center mb-2">
                ยืนยัน OTP
              </h3>

              <p className="text-sm text-center text-gray-600 mb-4">
                ระบบได้ส่งรหัส OTP ไปที่ <br />
                <strong>{form.phone}</strong>
              </p>

              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(val) => {
                  setOtp(val)
                  setError("")
                }}
                pattern={REGEXP_ONLY_DIGITS}
                className="flex justify-center mb-4"
              >

                <InputOTPGroup>
                  {[...Array(6)].map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              {error && (
                <p className="text-red-500 text-sm text-center mb-2">
                  {error}
                </p>
              )}

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  className="w-1/2"
                  onClick={() => {
                    setShowOtpModal(false)
                    setOtp("")
                  }}
                >
                  ยกเลิก
                </Button>

                <Button
                  className="w-1/2 bg-paseo"
                  disabled={otpLoading}
                  onClick={async () => {
                    setOtpLoading(true)

                    const res = await fetch("/api/auth/register/verify-otp", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        phone: form.phone,
                        otp,
                      }),
                    })

                    const data = await res.json()
                    setOtpLoading(false)

                    if (!res.ok) {
                      setError(data.error || "OTP ไม่ถูกต้อง")
                      return
                    }

                    // ✅ OTP ผ่าน
                    setShowOtpModal(false)
                    setOtp("")
                    setStep(2) // 👈 ไป step ถัดไป
                  }}
                >
                  ยืนยัน
                </Button>
              </div>
            </div>
          </div>
        )}

          <div className="text-center mt-4 mb-10">
            มีบัญชีอยู่แล้ว?{' '}
            <Link href="/auth/login" className="font-bold text-paseo">เข้าสู่ระบบ</Link>
          </div>
        </div>
    </div>
  )
}
