'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { loginWithLineHybrid } from "@/lib/liff-login";
import { useRouter } from 'next/navigation'
import { FaLine } from "react-icons/fa6";
import Link from 'next/link';
import Image from 'next/image';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, } from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { Button } from "@/components/ui/button"
import BannerLogin from "@/components/BannerLogin/page"
import Loading from '@/components/loading';
import HeaderMobile from '@/components/HeaderMobile/page';

export default function LoginPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [otpError, setOtpError] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const router = useRouter()

useEffect(() => {
  import("@/lib/liff-client").then((module) => {
    module.initLiff().catch((err) => {
      console.log("LIFF Init Failed:", err);
    });
  });
}, []);

  // ฟังก์ชันเดิมสำหรับตรวจสอบเบอร์และรหัสผ่าน
  const handleCheckCredentials = async () => {
    setError('')
    if (!phone) {
      setError('กรุณากรอกเบอร์โทรและรหัสผ่าน')
      return false
    }

    setLoading(true)
    const res = await fetch('/api/auth/check-credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'เกิดข้อผิดพลาด')
      return false
    }

    return true
  }

  // ฟังก์ชันเดิมสำหรับส่ง OTP
  const handleRequestOtp = async () => {
    if (countdown > 0) return

    setOtpError("")
    setOtpSent(false)

    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        purpose: "VERIFY_PHONE",
      }),
    })

    if (!res.ok) {
      let errorMessage = "ไม่สามารถส่ง OTP ได้"

      try {
        const data = await res.json()
        errorMessage = data?.error || errorMessage
      } catch {}

      setOtpError(errorMessage)
      return
    }

    // ✅ สำเร็จ
    setOtpSent(true)
    setCountdown(60)
  }

  // ฟังก์ชันใหม่สำหรับ Step 2 (ตรวจสอบเบอร์/รหัสผ่าน)
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    const isValid = await handleCheckCredentials()
    if (!isValid) return

    await handleRequestOtp()
    setStep(3) // ไปยัง Step 3
  }

  // ฟังก์ชันใหม่สำหรับ Step 3 (ยืนยัน OTP)
  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault()
    setOtpError('')

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        otp,
        purpose: "VERIFY_PHONE",
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      let errorMessage = "ไม่สามารถส่ง OTP ได้"

      try {
        const data = await res.json()
        errorMessage = data?.error || errorMessage
      } catch (e) {
        // response ไม่มี body → ใช้ default
      }

      setOtpError(errorMessage)
      return
    }

    // ✅ OTP ผ่าน → login จริง
    await signIn("credentials", {
      phone,
      redirect: false,
    })

    if (!res?.ok) {
      setOtpError('OTP ไม่ถูกต้องหรือหมดอายุ')
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [countdown])

  const { status } = useSession()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/')
    }
  }, [status])

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <div className="max-w-lg mx-auto p-0 mb-20 md:mb-0 mb-0 rounded-xl relative overflow-hidden">

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

        <div className="md:pt-4 pt-16 mb-0 py-4 px-4 md:px-4">
          <BannerLogin />
        </div>
        
        <div className="w-full p-10 m-0 rounded-t-5xl bg-white shadow z-50 md:relative fixed bottom-0">

          {/* --- Step 1: แสดงปุ่มเข้าสู่ระบบด้วย LINE และปุ่มสำหรับเบอร์โทรศัพท์ --- */}
          {step === 1 && (
            <>
              <div className="flex flex-col justify-center items-center space-y-6">

                <h2 className="text-l font-semibold mb-5 text-center text-black">เข้าสู่ระบบ</h2>
                <button
                  onClick={loginWithLineHybrid}
                  className="w-full text-white p-2 md:p-2 rounded-full flex justify-center items-center bg-paseo"
                  >
                  <FaLine className="h-6 w-6 text-white" />
                  <span className="flex-shrink mx-4 text-white">เข้าสู่ระบบด้วย LINE</span>
                </button>

                <button
                  onClick={() => setStep(2)}
                  className="w-full text-white p-2 md:p-2 rounded-full flex justify-center items-center" style={{ backgroundColor: '#9DC93C' }}
                >
                  <span>เข้าสู่ระบบด้วยเบอร์โทรศัพท์</span>
                </button>
              </div>
            </>
          )}

          {/* --- Step 2: ให้กรอกเบอร์โทรและรหัสผ่าน --- */}
          {step === 2 && (
            <>
              <div className="w-full flex flex-col justify-center items-center space-y-6">

                <h2 className="text-l font-semibold mb-5 text-center text-ิสฟแา">เข้าสู่ระบบด้วยเบอร์โทรศัพท์</h2>
                <form onSubmit={handleStep2} className="w-full space-y-4">
                  <input
                    type="text"
                    placeholder="เบอร์โทรศัพท์"
                    className="w-full pt-2 pb-2 pl-4 pr-4 border rounded-full bg-gray-100 focus:outline-none focus:ring focus:ring-paseo"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <button
                    type="submit"
                    className="w-full text-white p-2 md:p-2 rounded-full flex justify-center items-center" style={{ backgroundColor: '#9DC93C' }}
                    disabled={loading}
                  >
                    {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
                  </button>
                  
                  {/* ปุ่ม "กลับ" ที่เพิ่มเข้ามาใหม่ */}
                  <div className="flex flex-col items-center justify-center mt-4">
                    <span>หรือ</span>
                    <button
                      onClick={loginWithLineHybrid}
                      className="w-full text-white p-2 md:p-2 rounded-full flex justify-center items-center bg-paseo"
                    >
                      <FaLine className="h-6 w-6 text-white" />
                      <span className="flex-shrink mx-4 text-white">เข้าสู่ระบบด้วย LINE</span>
                    </button>
                    
                  </div>
                </form>
            </div>
          </>
        )}

          {/* --- Step 3: กรอก OTP --- */}
          {step === 3 && (
            <>
              <div className="w-full flex flex-col justify-center items-center space-y-6">

                <h2 className="text-l font-semibold mb-5 text-center">ยืนยัน OTP</h2>
                <form onSubmit={handleStep3} className="w-full space-y-4">
                  <p className="text-sm text-gray-600">
                    ได้ส่งรหัส OTP ไปยังเบอร์ <strong>{phone}</strong>
                  </p>
                    <div className="flex flex-col gap-2 w-full justify-center items-center space-y-2">
                    <InputOTP
                      maxLength={6}
                      pattern={REGEXP_ONLY_DIGITS}
                      value={otp}
                      onChange={(val) => {
                        setOtp(val)
                        setOtpError("")
                      }}
                      className="flex justify-center"
                    >
                      <InputOTPGroup>
                        {[...Array(6)].map((_, i) => (
                          <InputOTPSlot key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>

                    {otpError && (
                      <p className="text-red-500 text-sm text-center">{otpError}</p>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={countdown > 0}
                      className={`text-sm underline ${
                        countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600'
                      }`} style={{ color: '#9DC93C' }}
                    >
                      {countdown > 0 ? `ขอ OTP อีกครั้ง (${countdown}s)` : 'ขอ OTP อีกครั้ง'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(2)} // ย้อนกลับไป Step 2
                      className="text-sm text-gray-500 underline"
                    >
                      แก้ไขเบอร์ / รหัสผ่าน
                    </button>
                  </div>
                  <Button
                  type="submit"
                    className="w-full text-white p-2 md:p-2 rounded-xl flex justify-center items-center" style={{ backgroundColor: '#9DC93C' }}
                  >
                    ยืนยัน OTP
                  </Button>
                </form>
              </div>
            </>
          )}

          <div className="text-center mt-4">
            ยังไม่มีบัญชี?{' '}
            <Link href="/auth/register" className="font-bold" style={{ color: '#9DC93C' }}>
              สมัครสมาชิก
            </Link>
          </div>

        </div>

    </div>
  )
}