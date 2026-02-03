import { useState, useEffect } from "react"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, } from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { Button } from "./ui/button"

type Props = {
  phone: string
  onVerify: (otp: string) => Promise<void>
  onResend: () => Promise<void>
}

export function OtpVerifyForm({ phone, onVerify, onResend }: Props) {
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown(v => v - 1), 1000)
    return () => clearInterval(t)
  }, [countdown])

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        try {
          await onVerify(otp)
        } catch (err: any) {
          setError(err.message || "OTP ไม่ถูกต้อง")
        }
      }}
      className="w-full space-y-4"
    >
      <p className="text-sm text-gray-600 text-center">
        ส่งรหัส OTP ไปยัง <strong>{phone}</strong>
      </p>

      <InputOTP
        maxLength={6}
        pattern={REGEXP_ONLY_DIGITS}
        value={otp}
        onChange={(val) => {
          setOtp(val)
          setError("")
        }}
      >
        <InputOTPGroup>
          {[...Array(6)].map((_, i) => (
            <InputOTPSlot key={i} index={i} />
          ))}
        </InputOTPGroup>
      </InputOTP>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="flex justify-between text-sm">
        <button
          type="button"
          disabled={countdown > 0}
          onClick={async () => {
            await onResend()
            setCountdown(60)
          }}
          className={countdown > 0 ? "text-gray-400" : "text-paseo"}
        >
          {countdown > 0 ? `ขอ OTP อีกครั้ง (${countdown}s)` : "ขอ OTP อีกครั้ง"}
        </button>
      </div>

      <Button type="submit" className="w-full bg-paseo">
        ยืนยัน OTP
      </Button>
    </form>
  )
}
