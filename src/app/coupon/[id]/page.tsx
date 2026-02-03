"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { FaRegCalendarCheck } from "react-icons/fa";
import { CiBitcoin } from "react-icons/ci";
import { PiDotsThreeOutlineLight } from "react-icons/pi";
import BackButton from "@/components/BackButton/page";
import Loading from "@/components/loading";
import UserProfile from "@/components/UserProfile/page";
import ShareButton from "@/components/ShareButton/page";
import FavoriteButton from "@/components/FavoriteButton/page";
import html2canvas from "html2canvas";
import HeaderMobile from '@/components/HeaderMobile/page';
import UseCouponModal from "@/components/coupon/UseCouponModal";



type Coupon = {
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
  receivedCount: number;
  totalReceived: number;
  pointBalance: number;
  isFull: boolean;
  isExpired: boolean;
  isReceived: boolean;
  canReceive: boolean;
  startDate: string;
  endDate: string;
  locationLabel: string;
};

export default function CouponSinglePage() {
  const { data: session } = useSession();
  const { id } = useParams();

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pointBalance, setPointBalance] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [showUseModal, setShowUseModal] = useState(false);
  const [userCouponId, setUserCouponId] = useState<string | null>(null);

  const captureRef = useRef<HTMLDivElement>(null);

  // ✅ ดึงแต้มของผู้ใช้
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

  // ✅ ดึงข้อมูลคูปอง
  const fetchCoupon = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/coupon/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("ไม่พบคูปองนี้");
      const data = await res.json();
      setCoupon(data);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ✅ โหลดข้อมูลเมื่อเริ่มต้น
  useEffect(() => {
    if (session?.user?.id) {
      fetchBalance();
      fetchCoupon();
    }
  }, [session?.user?.id, fetchBalance, fetchCoupon]);

  // ✅ ฟังก์ชันรับคูปอง
const handleClaim = async () => {
  if (!coupon) return;
  setJoining(true);
  setError(null);

  try {
    const res = await fetch(`/api/coupon/${coupon.id}/join`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "ไม่สามารถรับคูปองได้");

    // ✅ เปิด modal แบบเต็มพร้อมข้อมูลคูปอง
    setUserCouponId(data.userCoupon?.id);
    setShowUseModal(true);

    await Promise.all([fetchCoupon(), fetchBalance()]);
  } catch (err: any) {
    setError(err.message || "เกิดข้อผิดพลาด");
  } finally {
    setJoining(false);
  }
};

  if (loading) return <Loading />;
  if (!coupon)
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <p>{error || "ไม่พบข้อมูลคูปองนี้"}</p>
      </div>
    );

  const now = new Date();
  const startDate = new Date(coupon.startDate);
  const endDate = new Date(coupon.endDate);
  const canJoin = !coupon.isReceived && now >= startDate && now <= endDate;

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

  const formatDate = (date: Date | null) =>
    date
      ? date.toLocaleDateString("th-TH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-";

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
    link.download = `${coupon.name}-capture.png`;
    link.click();

    // คืนค่า element ให้กลับมาแสดง
    hiddenEls.forEach((el) => (el as HTMLElement).style.display = "");
  };

  // ✅ แสดงปุ่มตามสถานะ
  const renderButton = () => {
    if (coupon.isExpired)
      return <button disabled className="btn-disable">คูปองหมดอายุแล้ว</button>;
    if (coupon.isFull)
      return <button disabled className="btn-disable">คูปองหมดแล้ว</button>;
    if (coupon.pointCost > pointBalance)
      return (
        <button disabled className="btn-disable">
          แต้มไม่เพียงพอ (มี {pointBalance} / ต้องใช้ {coupon.pointCost})
        </button>
      );
    if (coupon.maxPerUser && coupon.receivedCount >= coupon.maxPerUser)
      return (
        <button disabled className="btn-disable">
          คุณรับครบแล้ว ({coupon.receivedCount}/{coupon.maxPerUser})
        </button>
      );

    return (
      <button
        onClick={() => setShowConfirmModal(true)}
        disabled={joining}
        className="btn-main"
      >
        {joining ? "กำลังรับคูปอง..." : "รับคูปองนี้"}
        {coupon.maxPerUser && (
          <span className="text-xs block mt-1 text-gray-600 leading-none">
            รับได้ {coupon.maxPerUser} ครั้ง / รับไปแล้ว {coupon.receivedCount} ครั้ง
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
          className="capture relative max-w-2xl mx-auto md:pt-10 md:pb-0 pb-14 md:mb-10 pt-20 bg-gray-100 rounded-t-5xl rounded-b-xl flex flex-col  md:gap-6 gap-4"
        >
  
          <div className="px-4 md:px-10">
            {coupon.imageUrl && (
              <Image
                width={600}
                height={600}
                src={coupon.imageUrl}
                alt={coupon.name}
                className="w-full h-full object-cover rounded-2xl shadow border border-gray-100"
              />
            )}
          </div>

          <div className="px-4 md:px-10">
            <div className="flex flex-row justify-between align-start gap-4 bg-white md:p-6 p-4 rounded-2xl shadow border border-gray-100">
              <div className="flex flex-col gap-3">
                <h1 className="text-sm font-bold mb-2">{coupon.name}</h1>
                <div className="flex flex-row item-center align-center gap-4">
                  <FaRegCalendarCheck size={24} />
                  <p className="text-sm text-gray-500">
                    ตั้งแต่ {start_day} - {end_day} {end_month_long} {end_year} นี้
                  </p>
                </div>
  
                {coupon.pointCost > 0 && 
                <div className="flex flex-row item-center align-center gap-4">
                  <CiBitcoin size={24} />
                  <p className="text-sm text-gray-600">ค่าใช้จ่าย: {coupon.pointCost} พอยต์</p>
                </div>
                }
  
                {coupon.pointEarn > 0 && 
                <div className="flex flex-row item-center align-center gap-4">
                  <CiBitcoin size={24} />
                  <p className="text-sm text-gray-600">ผู้เข้าร่วมจะได้รับ: {coupon.pointEarn} พอยต์</p>
                </div>
                }
  
                <div className="flex flex-row item-center align-center gap-4">
                  <CiBitcoin size={24} />
                  <p className="text-sm text-gray-600">
                    แต้มของคุณ: <span className="font-semibold text-green-600">{pointBalance}</span> พอยต์
                  </p>
                </div>
              </div>
  
              <div className="flex flex-col items-center gap-2">
                {session?.user?.id && (
                  <FavoriteButton
                    targetId={coupon.id}
                    targetType="COUPON"
                    userId={session.user.id}
                  />
                )}
                <button
                  onClick={handleCapture}
                >
                  <PiDotsThreeOutlineLight size={24} />
                </button>
                <ShareButton
                  title={coupon?.name || "Event"}
                  linkShare={coupon?.linkShare}
                />
              </div>
  
            </div>
            
          </div>

        <div className="px-4 md:px-10">
          <div className="flex flex-col justify-between align-start gap-4 bg-white md:p-6 p-4 rounded-2xl shadow border border-gray-100">
            {coupon.description && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">รายละเอียด</h3>
                <div
                  className="prose text-gray-700"
                  dangerouslySetInnerHTML={{ __html: coupon.description }}
                />
              </div>
            )}

            {coupon.terms && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">เงื่อนไข</h3>
                <div
                  className="prose text-gray-700"
                  dangerouslySetInnerHTML={{ __html: coupon.terms }}
                />
              </div>
            )}

            {coupon.locationLabel && 
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-4">จุดแลกรับของราลวัล</h3>
              <p className="text-gray-700">{coupon.locationLabel}</p>
              </div>
            }
            </div>

          </div>

        {/* ✅ ปุ่มรับคูปอง */}
        <div className="max-w-2xl mx-auto bg-white w-full p-4 pb-4 md:p-4 md:rounded-2xl rounded-t-2xl shadow-sm border border-gray-200">
          {renderButton()}
        </div>

        {/* ✅ Modal ยืนยันการรับ */}
        {showConfirmModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
          style={{ backdropFilter: "blur(2px)" }}
        >
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-xl shadow-md max-w-sm w-full text-center">
              <h2 className="text-lg font-semibold mb-2">ยืนยันการรับคูปอง</h2>
              <p className="text-gray-700 mb-4">
                ต้องการใช้ {coupon.pointCost} พอยต์เพื่อรับคูปองนี้หรือไม่?
              </p>

              <div className="flex justify-center gap-3">
                <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                  ยกเลิก
                </button>
                <button
                  onClick={async () => {
                    setShowConfirmModal(false);
                    await handleClaim();
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

        {/* ✅ Modal หลังแลกสำเร็จ */}
        <UseCouponModal
          show={showUseModal}
          onClose={() => setShowUseModal(false)}
          userCouponId={userCouponId}
        />


      </div>
    </div>
  );
}
