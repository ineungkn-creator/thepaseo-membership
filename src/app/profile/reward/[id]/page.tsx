"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function RewardDetailPage() {
    const router = useRouter();
  const { id } = useParams();
  const [reward, setReward] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [usingReward, setUsingReward] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReward() {
      try {
        const res = await fetch(`/api/profile/reward/${id}`, {
          method: "GET",
        });
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
  }, [id]);

  async function handleUseReward() {
      setUsingReward(true);
      try {
          const res = await fetch(`/api/reward/${id}/use`, { method: "POST" });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "ไม่สามารถใช้รางวัลได้");

          // ⭐ โหลดข้อมูล rewardParticipation ที่อัปเดตจริง ๆ จาก DB
          const refresh = await fetch(`/api/profile/reward/${id}`);
          const freshData = await refresh.json();

          setReward(freshData);          // 👈 อัปเดต reward state ใหม่จริง
          setSuccess("ใช้รางวัลสำเร็จแล้ว"); // 👈 เปิด modal แสดงผลลัพธ์
          setShowModal(true);

      } catch (err: any) {
          alert(err.message);
      } finally {
          setUsingReward(false);
      }
  }

  if (loading)
    return <div className="p-6 text-center text-gray-500">กำลังโหลด...</div>;
  if (error)
    return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!reward)
    return <div className="p-6 text-center text-gray-500">ไม่พบข้อมูลรางวัล</div>;

  const isExpired = reward.reward?.expiresAt
    ? new Date(reward.reward.expiresAt) < new Date()
    : false;

  return (
    <>
        <div className="relative max-w-2xl mx-auto p-0 pt-10 bg-gray-100 rounded-5xl shadow-md">

            {/* รหัส Redeem */}
            <div className="px-4 pt-0 md:px-10 md:pt-0">
                <div className="bg-gray-50 border rounded-xl p-4 text-center">
                    <p className="text-gray-500 text-sm mb-1">รหัสสำหรับใช้รางวัล</p>
                    <p className="text-3xl font-bold tracking-widest">
                    {reward.redeemCode || "ไม่มีรหัส"}
                    </p>
                </div>
            </div>

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

            <div className="p-4 px-4 pt-0 md:p-10 md:pt-0">
                <div className="flex flex-col justify-between align-start gap-4 bg-white p-6 rounded-lg">
                    <h1 className="text-2xl font-bold">{reward.reward?.name}</h1>

                    {reward.reward?.description && (
                        <div className="mb-4">
                            <div
                                className="prose text-gray-700"
                                dangerouslySetInnerHTML={{ __html: reward.reward?.description }}
                            />
                    </div>
                    )}

                    {reward.reward?.expiresAt && (
                        <p className="text-sm text-gray-500">
                            หมดอายุ:{" "}
                            {new Date(reward.reward.expiresAt).toLocaleDateString("th-TH")}
                        </p>
                    )}
                </div>

            </div>


            <div className="max-w-2xl mr-auto ml-auto bg-white overflow-hidden w-full p-4 pb-20 md:p-4 text-black rounded-t-2xl shadow-sm border border-gray-200">
            
                {/* สถานะ */}
                {isExpired && (
                    <p className="text-center text-red-500 font-medium">
                    รางวัลนี้หมดอายุแล้ว
                    </p>
                )}
                {reward.used && !isExpired && (
                    <p className="text-center text-green-600 font-medium">
                    ✅ ใช้แล้วเมื่อ{" "}
                    {reward.usedAt
                        ? new Date(reward.usedAt).toLocaleString("th-TH")
                        : "ไม่ทราบเวลา"}
                    </p>
                )}

                {/* ปุ่มกดใช้คูปอง */}
                {!reward.used && !isExpired && (
                    <button
                    onClick={() => setShowModal(true)}
                    className="btn-main"
                    >
                    กดใช้รางวัลนี้
                    </button>
                )}
            </div>

        </div>
    
      {/* Modal ยืนยัน */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
          style={{ backdropFilter: "blur(2px)" }}
        >
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-80 space-y-4 text-center">
              <h2 className="text-xl font-bold">ยืนยันการใช้รางวัล</h2>
              <p className="text-sm text-gray-600">
                เมื่อกดยืนยันแล้วจะไม่สามารถย้อนกลับได้
              </p>

              <div className="flex gap-2 justify-center mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleUseReward}
                  disabled={usingReward}
                  className="px-4 py-2 bg-paseo text-white rounded-lg hover:bg-paseo-dark"
                >
                  {usingReward ? "กำลังใช้..." : "ยืนยันใช้"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ข้อความสำเร็จ */}
      {showModal && success && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
          style={{ backdropFilter: "blur(2px)" }}
        >
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-xl shadow-md max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold mb-2">{success}</h2>
            <p className="text-gray-600 mb-4">คุณสามารถกลับไปยังหน้ารายการรางวัลได้</p>
            <button
                onClick={() => router.push("/profile/reward")}
                className="px-4 py-2 rounded-lg bg-paseo text-white font-semibold hover:bg-paseo-hover transition"
            >
                ตกลง
            </button>
            </div>
        </div>
        </div>
        )}
    </>
  );
}
