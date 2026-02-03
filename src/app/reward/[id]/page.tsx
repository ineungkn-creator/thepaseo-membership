"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from 'next-auth/react';
import html2canvas from "html2canvas";
import Image from "next/image";
import FavoriteButton from '@/components/FavoriteButton/page';
import { PiDotsThreeOutlineLight } from "react-icons/pi";
import { FaRegCalendarCheck, FaCalendarCheck } from "react-icons/fa";
import { CiBitcoin } from "react-icons/ci";
import BackButton from '@/components/BackButton/page';
import ShareButton from '@/components/ShareButton/page';
import Loading from '@/components/loading';
import UserProfile from '@/components/UserProfile/page';
import HeaderMobile from '@/components/HeaderMobile/page';
import UseRewardModal from "@/components/reward/UseRewardModal";

type Reward = {
  id: string;
  name: string;
  description?: string;
  terms?: string;
  imageUrl?: string;
  linkShare?: string;

  pointCost: number;
  pointEarn: number;

  quantity: number | null;
  maxPerUser: number | null;

  joinedCount: number;
  joinedCountByUser: number;

  hasJoined: boolean;      // ✅ เคยแลกอย่างน้อย 1 ครั้ง
  reachedLimit: boolean;  // ✅ ใช้สิทธิ์ครบ maxPerUser แล้วหรือยัง

  userPointBalance: number;

  isFull: boolean;
  isExpired: boolean;
  canRedeem: boolean;     // ✅ backend คำนวณให้แล้ว

  startDate: string;
  endDate: string;
  locationLabel: string;
};

export default function RewardSinglePage() {
  const { data: session } = useSession();
  const { id } = useParams();
  const [reward, setReward] = useState<Reward | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pointBalance, setPointBalance] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [showUseModal, setShowUseModal] = useState(false);
  const [userRewardId, setUserRewardId] = useState<string | null>(null);

  const captureRef = useRef<HTMLDivElement>(null);

  // ✅ ดึงข้อมูลแต้มของ user
  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch("/api/points/balance");
      if (!res.ok) return;
      const data = await res.json();
      setPointBalance(data.balance || 0);
    } catch {
      setPointBalance(0);
    }
  }, []);

  // ✅ ดึงข้อมูล reward
  const fetchReward = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reward/${id}`);
      if (!res.ok) throw new Error("ไม่พบ Reward");
      const data = await res.json();
      setReward(data);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchBalance();
      fetchReward();
    }
  }, [session?.user?.id, fetchBalance, fetchReward]);

  // ✅ แลกรางวัล
const handleJoin = async () => {
  if (!reward) return;
  setJoining(true);
  setError(null);

  try {
    const res = await fetch(`/api/reward/join`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "ไม่สามารถแลกรางวัลได้");

    // ✅ เปิด modal เต็มหน้าจอพร้อมข้อมูลรางวัลที่เพิ่งแลก
    setUserRewardId(data.participation?.id);
    setShowUseModal(true);

    await Promise.all([fetchReward(), fetchBalance()]);
  } catch (err: any) {
    setError(err.message || "เกิดข้อผิดพลาด");
  } finally {
    setJoining(false);
  }
};

  // ✅ โหลดหน้า
  if (loading) return <Loading />;
  if (!reward)
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <p>{error || "ไม่พบข้อมูล Reward นี้"}</p>
      </div>
    );

  const now = new Date();
  const startDate = new Date(reward.startDate);
  const endDate = new Date(reward.endDate);
  const canJoin =
    reward.canRedeem &&
    now >= startDate &&
    now <= endDate;

  const monthNames = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
  ];

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  let status = "";
  if (now < startDate) {
    status = "กำลังจะจัด";
  } else if (now >= startDate && now <= endDate) {
    status = "กำลังจัด";
  } else if (now > endDate) {
    status = "สิ้นสุดแล้ว";
  }

  const start_day = startDate.getDate();
  const start_month_index = startDate.getMonth();
  const start_year = startDate.getFullYear();

  const end_day = endDate.getDate();
  const end_month_index = endDate.getMonth();
  const end_year = endDate.getFullYear();

  const start_month_text = monthNames[start_month_index];
  const end_month_text = monthNames[end_month_index];

  const monthOptions: Intl.DateTimeFormatOptions = { month: "long" };
  const start_month_long = startDate.toLocaleDateString("th-TH", monthOptions);
  const end_month_long = endDate.toLocaleDateString("th-TH", monthOptions);

  const startDate_time = startDate.toLocaleTimeString("th-TH", timeOptions);
  const endDate_time = endDate.toLocaleTimeString("th-TH", timeOptions);

  const handleCapture = async () => {
    if (!captureRef.current) return;

    // ซ่อน element ที่ไม่ต้อง capture
    const hiddenEls = captureRef.current.querySelectorAll(".hidden-capture");
    hiddenEls.forEach((el) => (el as HTMLElement).style.display = "none");

    // แคปหน้าจอ
    const canvas = await html2canvas(captureRef.current, { scale: 2 });
    const dataUrl = canvas.toDataURL("image/png");

    // โหลดเป็นไฟล์ PNG
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${reward.name}-capture.png`;
    link.click();

    // คืนค่า element ให้กลับมาแสดง
    hiddenEls.forEach((el) => (el as HTMLElement).style.display = "");
  };

  // ✅ ปุ่มแลกรางวัล
  const renderButton = () => {
    if (reward.isExpired)
      return (
        <button disabled className="btn-disable">
          กิจกรรมสิ้นสุดแล้ว
        </button>
      );

    if (reward.isFull)
      return (
        <button disabled className="btn-disable">
          ของรางวัลหมดแล้ว
        </button>
      );

    if (reward.reachedLimit)
      return (
        <button disabled className="btn-disable">
          คุณแลกครบแล้ว ({reward.joinedCountByUser}/{reward.maxPerUser})
        </button>
      );

    if (reward.pointCost > pointBalance)
      return (
        <button disabled className="btn-disable">
          แต้มไม่เพียงพอ (มี {pointBalance} / ต้องใช้ {reward.pointCost})
        </button>
      );

    return (
      <button
        onClick={() => setShowConfirmModal(true)}
        disabled={joining}
        className="btn-main"
      >
        <span className="text-base block text-white leading-none">
          {joining ? "กำลังแลกรางวัล..." : "แลกรางวัลนี้"}
        </span>

        {reward.maxPerUser && (
          <span className="text-xs block text-white leading-none">
            แลกแล้ว {reward.joinedCountByUser} / {reward.maxPerUser} ครั้ง
          </span>
        )}
      </button>
    );
  };

  return (
      <div>
        <HeaderMobile />
      
        <div className="max-w-2xl mx-auto -mb-14 md:mt-20 md:-mb-16 pt-16  rounded-xl">
          <div className="w-full px-10 md:pt-0 md:px-20 md:pb-0">
            <UserProfile  />
          </div>
        </div>
        <div
          ref={captureRef}
          className="capture relative max-w-2xl mx-auto md:pt-10 md:pb-0 pb-14 md:mb-10 pt-20 bg-gray-100 rounded-t-5xl rounded-b-xl flex flex-col md:gap-6 gap-4"
        >
  
          <div className="px-4 md:px-10">
          {reward.imageUrl && (
            <Image
              width={600}
              height={600}
              src={reward.imageUrl}
              alt={reward.name}
              className="w-full h-full object-cover rounded-2xl shadow border border-gray-100"
            />
          )}
        </div>

        {/* ✅ รายละเอียด */}
         <div className="px-4 md:px-10">
            <div className="flex flex-row justify-between align-start gap-4 bg-white md:p-6 p-4 rounded-2xl shadow border border-gray-100">
            <div className="flex flex-col gap-3">
              <h1 className="text-sm font-bold">{reward.name}</h1>
              <div className="flex flex-row item-center align-center gap-4">
                <FaRegCalendarCheck size={24} />
                <p className="text-sm text-gray-500">
                  ตั้งแต่ {start_day} - {end_day} {end_month_long} {end_year} นี้
                </p>
              </div>
              {reward.pointCost > 0 && 
              <div className="flex flex-row item-center align-center gap-4">
                <CiBitcoin size={24} />
                <p className="text-sm text-gray-600">ค่าใช้จ่าย: {reward.pointCost} พอยต์</p>
              </div>
              }
              {reward.pointEarn > 0 && 
              <div className="flex flex-row item-center align-center gap-4">
                <CiBitcoin size={24} />
                <p className="text-sm text-gray-600">ผู้เข้าร่วมจะได้รับ: {reward.pointEarn} พอยต์</p>
              </div>
              }

              <div className="flex flex-row item-center align-center gap-4">
                <CiBitcoin size={24} />
                <p className="text-sm text-gray-600">
                  แต้มของคุณ: <span className="font-semibold text-green-600">{pointBalance}</span> พอยต์
                </p>
              </div>

              {reward.joinedCount > 0 && 
              <div className="flex flex-row item-center align-center gap-4">
                <FaCalendarCheck size={24} />
                <p className="text-sm text-gray-600">ผู้เข้าร่วม: {reward.joinedCount} คน</p>
              </div>
              }
            </div>
            <div className="flex flex-col items-center gap-4">
              {session?.user?.id && (
                <FavoriteButton
                  targetId={reward.id}
                  targetType="REWARD"
                  userId={session.user.id}
                />
              )}
              <button
                onClick={handleCapture}
              >
                <PiDotsThreeOutlineLight size={24} />
              </button>
              <ShareButton
                title={reward?.name || "Event"}
                linkShare={reward?.linkShare}
              />
            </div>

          </div>
          
        </div>

        <div className="px-4 md:px-10">
          <div className="flex flex-col justify-between align-start gap-4 bg-white md:p-6 p-4 rounded-2xl shadow border border-gray-100">
          {reward.description && 
            <div>
              <h3 className="text-sm font-bold mb-4">รายละเอียด</h3>
              <div
                className="prose text-sm mb-2 prose-ol:list-decimal prose-ol:pl-6 prose-ul:list-disc prose-ul:pl-6"
                dangerouslySetInnerHTML={{ __html: reward.description }}
              />
            </div>
          }
          {reward.terms && 
            <div>
              <h3 className="text-sm font-bold mb-4">เงื่อนไขกิจกรรม</h3>
              <div
                className="prose text-sm mb-2 prose-ol:list-decimal prose-ol:pl-6 prose-ul:list-disc prose-ul:pl-6"
                dangerouslySetInnerHTML={{ __html: reward.terms }}
              />
            </div>
          }

          {reward.locationLabel && 
            <div>
              <h3 className="text-sm font-bold mb-4">จุดแลกรับของราลวัล</h3>
            <p className="textsm text-gray-700">{reward.locationLabel}</p>
            </div>
          }
          </div>

        </div>

        {/* ✅ ปุ่มแลกรางวัล */}
        <div className="max-w-2xl mx-auto bg-white w-full p-4 pb-4 md:p-4 md:rounded-2xl rounded-t-2xl shadow-sm border border-gray-200">
          {renderButton()}
        </div>

        {/* ✅ Modal ยืนยันการแลก */}
        {showConfirmModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
          style={{ backdropFilter: "blur(2px)" }}
        >
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-xl shadow-md max-w-sm w-full text-center">
              <h2 className="text-sm font-semibold mb-2">ยืนยันการแลก</h2>
              <p className="text-gray-700 mb-4">
                คุณต้องการแลกรางวัลนี้โดยใช้ {reward.pointCost} พอยต์หรือไม่?
              </p>

              <div className="flex justify-center gap-3">
                <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                  ยกเลิก
                </button>
                <button
                  onClick={async () => {
                    setShowConfirmModal(false);
                    await handleJoin();
                  }}
                  className="px-4 py-2 rounded-lg bg-paseo text-white font-semibold"
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* ✅ Modal หลังแลกรางวัลสำเร็จ */}
        <UseRewardModal
          show={showUseModal}
          onClose={() => setShowUseModal(false)}
          userRewardId={userRewardId}
        />


      </div>
    </div>
  );
}
