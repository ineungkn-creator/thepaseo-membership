"use client";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useState } from "react";

interface OtpVerifyModalProps {
  open: boolean;
  phone: string;
  onClose: () => void;
  onVerified: () => void;
}

export default function OtpVerifyModal({
  open,
  phone,
  onClose,
  onVerified,
}: OtpVerifyModalProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("กรุณากรอก OTP ให้ครบ 6 หลัก");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone }),
    })

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "OTP ไม่ถูกต้อง");
      return;
    }

    setOtp("");
    onVerified();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
      style={{ backdropFilter: "blur(2px)" }}
    >
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold text-center mb-2">
          ยืนยัน OTP
        </h3>

        <p className="text-sm text-center text-gray-600 mb-4">
          ระบบได้ส่งรหัส OTP ไปที่ <br />
          <strong>{phone}</strong>
        </p>

        <InputOTP
          maxLength={6}
          value={otp}
          onChange={(val) => {
            setOtp(val);
            setError("");
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
            onClick={onClose}
          >
            ยกเลิก
          </Button>

          <Button
            className="w-1/2 bg-paseo"
            disabled={loading}
            onClick={handleVerify}
          >
            ยืนยัน
          </Button>
        </div>
      </div>
    </div>
  );
}
