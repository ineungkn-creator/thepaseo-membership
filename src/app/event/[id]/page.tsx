"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import html2canvas from "html2canvas";
import FavoriteButton from "@/components/FavoriteButton/page";
import { PiDotsThreeOutlineLight } from "react-icons/pi";
import { FaRegCalendarCheck } from "react-icons/fa";
import { CiBitcoin } from "react-icons/ci";
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

  if (isExpired) {
    buttonText = "กิจกรรมสิ้นสุดแล้ว";
    buttonClass = "btn-disable";
    disabled = true;
  } else if (isFull) {
    buttonText = "กิจกรรมเต็มแล้ว";
    buttonClass = "btn-disable";
    disabled = true;
  } else if (event.isJoined) {
    buttonText = "เข้าร่วมแล้ว";
    buttonClass = "btn-disable";
    disabled = true;
  } else if (insufficientPoints) {
    buttonText = `แต้มไม่เพียงพอ (${pointBalance}/${event.pointCost})`;
    buttonClass = "btn-disable";
    disabled = true;
  } else {
    buttonText = "เข้าร่วมกิจกรรม";
    buttonClass = "btn-main";
  }

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
          {event.imageUrl &&
            <Image
              width={600}
              height={600}
              src={event.imageUrl}
              alt={event.name}
              className="w-full h-full object-cover rounded-2xl shadow border border-gray-100"
            />
          }

        </div>

         <div className="px-4 md:px-10">
            <div className="flex flex-row justify-between align-start gap-4 bg-white md:p-6 p-4 rounded-2xl shadow border border-gray-100">
            <div className="flex flex-col gap-3">
              <h1 className="text-sm font-bold">{event.name}</h1>

              <div className="flex flex-row item-center align-center gap-4">
                <FaRegCalendarCheck size={24} />
                <p className="text-sm text-gray-500">
                  ตั้งแต่ {start_day} - {end_day} {end_month_long} {end_year} นี้
                </p>
              </div>

            {event.pointCost > 0 && (
              <div className="flex flex-row item-center align-center gap-4">
                <CiBitcoin size={24} />
                <p className="text-sm text-gray-600">ใช้แต้ม: {event.pointCost}</p>
              </div>
            )}

            {event.pointEarn > 0 && (
              <div className="flex flex-row item-center align-center gap-4">
                <CiBitcoin size={24} />
                <p className="text-sm text-gray-600">ได้รับแต้ม: {event.pointEarn}</p>
              </div>
            )}

            <div className="flex flex-row item-center align-center gap-4">
              <CiBitcoin size={24} />
              <p className="text-sm text-gray-600">
                แต้มของคุณ:{" "}
                <span className="text-green-600 font-semibold">
                  {pointBalance}
                </span>
              </p>
            </div>

            <div className="flex flex-row item-center align-center gap-4">
              <CiBitcoin size={24} />
              <p className="text-sm text-gray-600">
                ผู้เข้าร่วม: {event.joinedCount}/{event.quantity}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            {session?.user?.id && (
              <FavoriteButton
                targetId={event.id}
                targetType="EVENT"
                userId={session.user.id}
              />
            )}
            <button
              onClick={handleCapture}
            >
              <PiDotsThreeOutlineLight size={24} />
            </button>
            <ShareButton title={event.name} linkShare={event.linkShare} />
          </div>

          </div>
          
        </div>

        {event.description && (
        <div className="px-4 md:px-10">
          <div className="flex flex-col justify-between align-start gap-4 bg-white md:p-6 p-4 rounded-2xl shadow border border-gray-100">

              <div>
                <h3 className="text-sm font-bold mb-4">รายละเอียด</h3>
                <div
                  className="prose text-sm"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              </div>

            </div>

        </div>
        )}


        {event.terms && (
        <div className="px-4 md:px-10">
          <div className="flex flex-col justify-between align-start gap-4 bg-white md:p-6 p-4 rounded-2xl shadow border border-gray-100">

              <div className="mb-4">
                <h3 className="text-sm font-bold mb-4">เงื่อนไขกิจกรรม</h3>
                <div
                  className="prose text-sm"
                  dangerouslySetInnerHTML={{ __html: event.terms }}
                />
              </div>
            </div>

        </div>
        )}

        {/* ✅ ปุ่มเข้าร่วม */}
        <div className="max-w-2xl mx-auto bg-white w-full p-4 pb-4 md:p-4 md:rounded-2xl rounded-t-2xl shadow-sm border border-gray-200">
          <button
            disabled={disabled || joining}
            onClick={() => {
              if (canJoin) setShowConfirmModal(true);
            }}
            className={`w-full py-3 rounded-2xl shadow-md font-semibold text-white ${buttonClass}`}
          >
            {joining ? "กำลังเข้าร่วม..." : buttonText}
          </button>
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