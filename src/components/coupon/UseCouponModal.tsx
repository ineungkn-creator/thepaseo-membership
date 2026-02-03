"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface UseCouponModalProps {
  show: boolean;
  onClose: () => void;
  userCouponId: string | null;
}

export default function UseCouponModal({ show, onClose, userCouponId }: UseCouponModalProps) {
  const router = useRouter();
  const [coupon, setCoupon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [usingCoupon, setUsingCoupon] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  useEffect(() => {
    if (!show || !userCouponId) return;

    async function fetchCoupon() {
      try {
        const res = await fetch(`/api/coupon/${userCouponId}/join`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "ไม่สามารถโหลดข้อมูลคูปองได้");
        setCoupon(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCoupon();
  }, [show, userCouponId]);

  async function handleUseCoupon() {
    if (!coupon) return;
    setUsingCoupon(true);
    try {
      const res = await fetch(`/api/coupon/${coupon.id}/use`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "ไม่สามารถใช้คูปองได้");

      // ✅ ตั้งค่าหลังใช้สำเร็จ
      setSuccessMessage("✅ ใช้คูปองเรียบร้อยแล้ว");
      setCoupon({
        ...coupon,
        used: true,
        usedAt: new Date().toISOString(),
      });
      setShowConfirm(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUsingCoupon(false);
    }
  }

  if (!show) return null;

  // ✅ Overlay หลักของ Modal
  return (
  <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
      style={{ backdropFilter: "blur(2px)" }}
    >
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto py-10">
      <div className="bg-gray-100 max-w-2xl w-full rounded-3xl shadow-lg animate-fade-in">
        {loading && <p className="text-center p-6 text-gray-500">กำลังโหลด...</p>}
        {error && <p className="text-center p-6 text-red-500">{error}</p>}

        {coupon && (
          <div className="relative overflow-hidden">
            <button
                onClick={onClose}
                className="absolute top-10 md:right-12 right-6 blur2 border border-gray-300 h-10 w-10 rounded-full text-xl font-bold"
            >
                X
            </button>
            
            {/* ✅ Redeem Code */}
            <div className="px-4 pt-8 md:px-10">
              <div className="bg-white border rounded-xl p-4 text-center">
                <p className="text-gray-500 text-sm mb-1">รหัสสำหรับใช้คูปอง</p>
                <p className="text-3xl font-bold tracking-widest">
                  {coupon.redeemCode || "ไม่มีรหัส"}
                </p>
              </div>
            </div>

            

            {/* ✅ รูป */}
            <div className="p-4 md:p-10">
              {coupon.coupon?.imageUrl && (
                <Image
                  width={600}
                  height={600}
                  src={coupon.coupon.imageUrl}
                  alt={coupon.coupon.name}
                  className="w-full h-full object-cover rounded-xl shadow-md"
                />
              )}
            </div>

            {/* ✅ รายละเอียด */}
            <div className="p-4 px-4 pt-0 md:p-10 md:pt-0">
              <div className="flex flex-col gap-4 bg-white p-6 rounded-lg">
                {coupon.coupon?.expiresAt && (
                  <p className="text-sm text-gray-500">
                    หมดอายุ:{" "}
                    {new Date(coupon.coupon.expiresAt).toLocaleDateString("th-TH")}
                  </p>
                )}

                <h1 className="text-base font-bold">{coupon.coupon?.name}</h1>

                {coupon.coupon?.description && (
                  <div className="mb-4">
                    <div
                      className="text-sm prose text-gray-700"
                      dangerouslySetInnerHTML={{ __html: coupon.coupon?.description }}
                    />
                  </div>
                )}

                
              </div>
            </div>

            {/* ✅ ปุ่มกดใช้คูปอง */}
            <div className="md:relative fixed bottom-0 w-full bg-white border-t p-4 rounded-3xl md:rounded-b-3xl rounded-b-none flex flex-col items-center gap-2">
              {!coupon.used && (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="btn-main w-full"
                >
                  กดใช้คูปองนี้
                </button>
              )}
              {coupon.used && (
                <p className="text-center text-green-600 font-medium">
                  ✅ ใช้แล้วเมื่อ{" "}
                  {coupon.usedAt
                    ? new Date(coupon.usedAt).toLocaleString("th-TH")
                    : "ไม่ทราบเวลา"}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      

      {/* ✅ Modal ยืนยันใช้คูปอง */}
      {showConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-[60]"
          style={{ backdropFilter: "blur(2px)" }}
        >
          <div className="bg-white rounded-xl shadow-lg p-6 w-80 space-y-4 text-center">
            <h2 className="text-xl font-bold">ยืนยันการใช้คูปอง</h2>
            <p className="text-sm text-gray-600">
              เมื่อกดยืนยันแล้วจะไม่สามารถย้อนกลับได้
            </p>

            <div className="flex gap-2 justify-center mt-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleUseCoupon}
                disabled={usingCoupon}
                className="px-4 py-2 bg-paseo text-white rounded-lg hover:bg-paseo-dark"
              >
                {usingCoupon ? "กำลังใช้..." : "ยืนยันใช้คูปอง"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal หลังใช้สำเร็จ */}
      {successMessage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-[70]"
          style={{ backdropFilter: "blur(2px)" }}
        >
          <div className="bg-white p-6 rounded-xl shadow-md max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold mb-2">{successMessage}</h2>
            <p className="text-gray-600 mb-4">
              คุณสามารถกลับไปยังหน้าคูปองของคุณได้
            </p>

            <button
              onClick={() => router.push("/profile/coupon")}
              className="px-4 py-2 rounded-lg bg-paseo text-white font-semibold hover:bg-paseo-dark transition"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
