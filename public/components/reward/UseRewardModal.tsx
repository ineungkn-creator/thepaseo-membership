"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface UseRewardModalProps {
  show: boolean;
  onClose: () => void;
  userRewardId: string | null;
}

export default function UseRewardModal({ show, onClose, userRewardId }: UseRewardModalProps) {
  const router = useRouter();
  const [reward, setReward] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [usingReward, setUsingReward] = useState(false);
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

    // ⭐ รีเซ็ตสถานะ modal ทุกครั้งที่เปิด
    useEffect(() => {
      if (show) {
        setLoading(true);
        setError(null);
        setReward(null);
      }
    }, [show]);

    // ⭐ โหลดข้อมูลใหม่ทุกครั้งที่ userRewardId เปลี่ยน
    useEffect(() => {
      if (!show || !userRewardId) return;

      async function fetchReward() {
        try {
          const res = await fetch(`/api/profile/reward/${userRewardId}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "ไม่สามารถโหลดข้อมูลรางวัลได้");
          setReward(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }

      fetchReward();
    }, [show, userRewardId]);


  async function handleUseReward() {
    if (!reward) return;
    setUsingReward(true);
    try {
      const res = await fetch(`/api/reward/${reward.id}/use`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "ไม่สามารถใช้รางวัลได้");

      // ✅ ตั้งค่าหลังใช้สำเร็จ
      setSuccessMessage("✅ ใช้รางวัลเรียบร้อยแล้ว");
      setReward({
        ...reward,
        redeemed: true,
        redeemedAt: new Date().toISOString(),
      });
      setShowConfirm(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUsingReward(false);
    }
  }

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
      style={{ backdropFilter: "blur(2px)" }}
    >
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto py-10">
            <div className="bg-gray-100 max-w-2xl w-full rounded-3xl shadow-lg animate-fade-in">
                {loading && <p className="text-center p-6 text-gray-500">กำลังโหลด...</p>}
                {error && <p className="text-center p-6 text-red-500">{error}</p>}

                {reward && (
                <>
                    {/* ✅ รหัส Redeem */}
                  <div className="px-4 pt-8 md:px-10">
                    <div className="bg-gray-50 border rounded-xl py-8 text-center">
                        <p className="text-gray-500 text-sm mb-1">รหัสสำหรับใช้รางวัล</p>
                        <p className="text-3xl font-bold tracking-widest">
                        {reward.redeemCode || "ไม่มีรหัส"}
                        </p>
                    </div>
                  </div>

                  <button
                      onClick={onClose}
                      className="fixed top-12 right-4 blur2 border border-gray-300 h-10 w-10 rounded-full text-xl font-bold"
                  >
                      X
                  </button>

                    {/* ✅ รูป */}
                    <div className="p-4 md:p-10">
                    {reward.reward?.imageUrl && (
                        <Image
                          width={600}
                          height={600}
                          src={reward.reward.imageUrl}
                          alt={reward.reward.name}
                          className="w-full h-full object-cover rounded-xl shadow-md"
                        />
                    )}
                    </div>

                    {/* ✅ รายละเอียด */}
                    <div className="p-4 px-4 pt-0 md:p-10 md:pt-0">
                      <div className="flex flex-col justify-between align-start gap-4 bg-white p-6 rounded-lg pb-10 mb-10">

                        <h1 className="text-base font-bold">{reward.reward?.name}</h1>

                        {reward.reward?.description && (
                        <div className="mb-4">
                            <div
                            className="text-sm prose text-gray-700"
                            dangerouslySetInnerHTML={{ __html: reward.reward?.description }}
                            />
                        </div>
                        )}

                      </div>
                    </div>

                    {/* ✅ ปุ่มใช้งาน */}
                    <div className="fixed bottom-0 w-full bg-white border-t p-4 rounded-3xl rounded-b-none flex flex-col items-center gap-2">
                    {!reward.used && (
                        <button
                        onClick={() => setShowConfirm(true)}
                        className="btn-main w-full"
                        >
                        กดใช้รางวัลนี้
                        </button>
                    )}
                    {reward.used && (
                        <p className="text-center text-green-600 font-medium">
                        ✅ ใช้แล้วเมื่อ{" "}
                        {reward.usedAt
                            ? new Date(reward.usedAt).toLocaleString("th-TH")
                            : "ไม่ทราบเวลา"}
                        </p>
                    )}
                    
                    </div>
                </>
                )}
            </div>

            {/* ✅ Modal ยืนยันการใช้ */}
            {showConfirm && (
                <div
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-[60]"
                style={{ backdropFilter: "blur(2px)" }}
                >
                <div className="bg-white rounded-xl shadow-lg p-6 w-80 space-y-4 text-center">
                    <h2 className="text-xl font-bold">ยืนยันการใช้รางวัล</h2>
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
                        onClick={handleUseReward}
                        disabled={usingReward}
                        className="px-4 py-2 bg-paseo text-white rounded-lg hover:bg-paseo-dark"
                    >
                        {usingReward ? "กำลังใช้..." : "ยืนยันใช้รางวัล"}
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
                    <p className="text-gray-600 mb-4">คุณสามารถกลับไปยังหน้ารางวัลของคุณได้</p>

                    <button
                    onClick={() => router.push("/profile/reward")}
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
