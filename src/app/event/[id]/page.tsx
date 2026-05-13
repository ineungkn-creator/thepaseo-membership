"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import html2canvas from "html2canvas";
import FavoriteButton from "@/components/FavoriteButton/page";
import { PiDotsThreeOutlineLight } from "react-icons/pi";
import { CiCalendar } from "react-icons/ci";
import { CiBitcoin } from "react-icons/ci";
import { IoMdMore } from "react-icons/io";
import HeaderMobile from '@/components/HeaderMobile/page';
import ShareButton from "@/components/ShareButton/page";
import Loading from "@/components/loading";
import UserProfile from '@/components/UserProfile/page';

type Event = {
  id: string;
  name: string;
  linkShare?: string;
  description?: string;
  terms?: string;
  imageUrl?: string;
  pointCost: number;
  pointEarn: number;
  maxPerUser: number | null;
  quantity: number | null;
  joinedCount: number;
  startDate: string;
  endDate: string;
  isJoined: boolean;
};

export default function EventSinglePage() {
  const { data: session } = useSession();
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pointBalance, setPointBalance] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const captureRef = useRef<HTMLDivElement>(null);

  // ✅ โหลดแต้มของ user
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/points/balance");
        if (!res.ok) return;
        const data = await res.json();
        setPointBalance(data.balance || 0);
      } catch {
        setPointBalance(0);
      }
    };
    if (session?.user?.id) fetchBalance();
  }, [session?.user?.id]);

  // ✅ โหลดข้อมูล Event
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/event/${id}`, {
          headers: { "x-user-id": session?.user?.id || "" },
        });
        if (!res.ok) throw new Error("ไม่พบ Event");
        const data = await res.json();
        setEvent(data);
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent();
  }, [id, session?.user?.id]);

  // ✅ ฟังก์ชันเข้าร่วมกิจกรรม
  const handleJoin = async () => {
    if (!event || event.isJoined) return;
    setJoining(true);
    try {
      const res = await fetch(`/api/event/${id}/join`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถเข้าร่วมได้");
      alert("🎉 เข้าร่วมกิจกรรมสำเร็จ!");
      setEvent((prev) =>
        prev ? { ...prev, isJoined: true, joinedCount: prev.joinedCount + 1 } : prev
      );
      // อัปเดตแต้มใหม่
      const bal = await fetch("/api/points/balance").then((r) => r.json());
      setPointBalance(bal.balance || 0);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setJoining(false);
    }
  };

  // ✅ แคปภาพ
  const handleCapture = async () => {
    if (!captureRef.current) return;
    const hiddenEls = captureRef.current.querySelectorAll(".hidden-capture");
    hiddenEls.forEach((el) => ((el as HTMLElement).style.display = "none"));
    const canvas = await html2canvas(captureRef.current, { scale: 2 });
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${event?.name}-capture.png`;
    link.click();
    hiddenEls.forEach((el) => ((el as HTMLElement).style.display = ""));
  };

  if (loading) return <Loading />;
  if (!event)
    return (
      <div className="p-6 text-center">
        <p>{error || "ไม่พบข้อมูลกิจกรรมนี้"}</p>
      </div>
    );

  // ✅ ตรวจสอบสถานะ
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isExpired = endDate < now;
  const isFull = event.quantity && event.joinedCount >= event.quantity;
  const insufficientPoints = event.pointCost > pointBalance;
  const canJoin = !event.isJoined && !isFull && !isExpired && !insufficientPoints;

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

  // ✅ กำหนดข้อความบนปุ่ม
  let buttonText = "";
  let buttonClass = "";
  let disabled = false;

  const renderJoinButton = () => {
    let disabled = false;
    let message = "";

    if (isExpired) {
      disabled = true;
      message = "กิจกรรมสิ้นสุดแล้ว";
    } else if (isFull) {
      disabled = true;
      message = "กิจกรรมเต็มแล้ว";
    } else if (event.isJoined) {
      disabled = true;
      message = "คุณเข้าร่วมแล้ว";
    } else if (insufficientPoints) {
      disabled = true;
      message = `แต้มไม่เพียงพอ (${pointBalance}/${event.pointCost})`;
    }

    return (
      <div className="flex flex-row justify-between items-center gap-4">
        
        {/* INFO */}
        <div className="flex flex-col gap-1">

          <p className="text-sm text-black">
            แต้มของคุณ: <b>{pointBalance}</b> พอยต์
          </p>

          {message && (
            <span className="text-xs text-red-500">{message}</span>
          )}
        </div>

        {/* BUTTON */}
        <button
          disabled={disabled || joining}
          onClick={() => {
            if (!disabled) setShowConfirmModal(true);
          }}
          className={`py-2 px-8 rounded-full ${
            disabled ? "bg-gray-300" : "bg-paseo"
          }`}
        >
          <span className="text-sm font-bold text-white">
            {joining ? "กำลังเข้าร่วม..." : "เข้าร่วมกิจกรรม"}
          </span>
        </button>
      </div>
    );
  };

    return (
      <div className="pt-16">
        <HeaderMobile />
      
        <div
          ref={captureRef}
          className="capture relative max-w-2xl mx-auto md:pt-10 md:pb-0 pb-40 md:mb-10 pt-8 md:mt-6 mt-0 bg-white rounded-xl flex flex-col md:gap-6 gap-4"
        >

          <div className="px-8 md:px-10">
            {event.imageUrl && (
              <Image
                width={600}
                height={600}
                src={event.imageUrl}
                alt={event.name}
                className="w-full h-full object-cover rounded-xl"
                unoptimized
              />
            )}

        <div className="w-full flex flex-row justify-end px-4 py-2 items-center gap-4">
            {session?.user?.id && (
              <FavoriteButton
                targetId={event.id}
                targetType="EVENT"
                userId={session.user.id}
              />
            )}
            
            <ShareButton
              title={event?.name || "Event"}
              linkShare={event?.linkShare}
            />

            <button
              onClick={handleCapture}
            >
              <IoMdMore size={24} />
            </button>
          </div>
        </div>

        <div className="px-8 md:px-10">
          <div className="flex flex-row justify-between align-start px-6">
            <h1 className="text-sm font-bold text-center">{event.name}</h1>
          </div>
        </div>

        <div className="px-8 md:px-10">
          <div className="flex flex-row justify-between align-start gap-4 bg-paseo-hover md:p-6 p-4 px-6 rounded-xl">
            <div className="flex flex-col gap-2">
              <div className="flex flex-row item-center align-center gap-4">
                <CiCalendar size={24} />
                <p className="text-sm text-black">
                  วันที่ {start_day} - {end_day} {end_month_long} {end_year} นี้
                </p>
              </div>

              {event.pointCost > 0 && 
              <div className="flex flex-row item-center align-center gap-4">
                <CiBitcoin size={24} />
                <p className="text-sm text-black">ค่าใช้จ่าย: {event.pointCost} พอยต์</p>
              </div>
              }

              {event.pointEarn > 0 && 
              <div className="flex flex-row item-center align-center gap-4">
                <CiBitcoin size={24} />
                <p className="text-sm text-black">ผู้เข้าร่วมจะได้รับ: {event.pointEarn} พอยต์</p>
              </div>
              }

              <div className="flex flex-row item-center align-center gap-4">
                <CiBitcoin size={24} />
                <p className="text-sm text-black">
                  แต้มของคุณ: {pointBalance} พอยต์
                </p>
              </div>
              
            </div>

          </div>
          
        </div>

        <div className="px-8 md:px-10">
          <div className="flex flex-col justify-between align-start gap-4">
            {event.description && (
              <div className="mb-4">
                <span className="text-base font-bold">รายละเอียด</span>
                <div
                  className="text-sm prose text-gray-700"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              </div>
            )}

            {event.terms && (
              <div className="mb-4">
                <span className="text-base font-bold">เงื่อนไข</span>
                <div
                  className="text-sm prose text-gray-700"
                  dangerouslySetInnerHTML={{ __html: event.terms }}
                />
              </div>
            )}

          </div>

        </div>

        {/* ✅ ปุ่มเข้าร่วม */}
        <div className="md:relative md:bottom-0 md:border-0 md:rounded-xl fixed bottom-12 max-w-2xl mx-auto bg-white w-full p-4 pb-6 md:p-8 border">
          {renderJoinButton()}
        </div>

        {/* ✅ Modal ยืนยัน */}
        {showConfirmModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white p-6 rounded-xl max-w-sm w-full text-center shadow-lg">
              <h2 className="text-sm font-semibold mb-2">ยืนยันการเข้าร่วม</h2>
              <p className="text-gray-700 mb-4">
                คุณต้องการเข้าร่วมกิจกรรมนี้ โดยใช้ {event.pointCost} พอยต์หรือไม่?
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 border rounded-2xl shadow-md hover:bg-gray-100"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={async () => {
                    setShowConfirmModal(false);
                    await handleJoin();
                  }}
                  className="px-4 py-2 bg-paseo text-white rounded-2xl shadow-md font-semibold"
                >
                  ยืนยัน
                </button>
              </div>
          </div>
        </div>
      )}
        
      </div>
    </div>
  );
}
