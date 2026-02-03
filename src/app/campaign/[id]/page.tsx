"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import html2canvas from "html2canvas";
import FavoriteButton from "@/components/FavoriteButton/page";
import { PiDotsThreeOutlineLight } from "react-icons/pi";
import { FaRegCalendarCheck } from "react-icons/fa";
import { CiBitcoin } from "react-icons/ci";
import ShareButton from "@/components/ShareButton/page";
import Loading from "@/components/loading";
import Link from "next/link";
import Image from "next/image";
import { RiCoupon2Fill } from "react-icons/ri";
import UserProfile from '@/components/UserProfile/page';
import HeaderMobile from '@/components/HeaderMobile/page';

type Coupon = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  expiresAt?: string;
  startDate: string;
  endDate: string;
  pointCost?: number;
  pointEarn?: number;
};

type Campaign = {
  id: string;
  name: string;
  description?: string;
  linkShare?: string;
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
  coupons: Coupon[];
};

export default function CampaignSinglePage() {
  const { data: session } = useSession();
  const { id } = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  // ✅ ดึงข้อมูล campaign + coupon
  useEffect(() => {
    const fetchCampaign = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/campaign/${id}`);
        if (!res.ok) throw new Error("ไม่พบ Campaign");
        const data = await res.json();
        setCampaign(data);
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCampaign();
  }, [id]);

  // ✅ ฟังก์ชันแคปภาพ
  const handleCapture = async () => {
    if (!captureRef.current) return;

    const hiddenEls = captureRef.current.querySelectorAll(".hidden-capture");
    hiddenEls.forEach((el) => ((el as HTMLElement).style.display = "none"));

    const canvas = await html2canvas(captureRef.current, { scale: 2 });
    const dataUrl = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${campaign?.name || "campaign"}-capture.png`;
    link.click();

    hiddenEls.forEach((el) => ((el as HTMLElement).style.display = ""));
  };

  if (loading) return <Loading />;
  if (!campaign)
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <p>{error || "ไม่พบข้อมูล Campaign นี้"}</p>
      </div>
    );

  const now = new Date();
  const startDate = new Date(campaign.startDate);
  const endDate = new Date(campaign.endDate);
  const canJoin = !campaign.isJoined && now >= startDate && now <= endDate;

  // ตรวจสอบสถานะของกิจกรรม
  let status = "";
  if (now < startDate) {
    status = "กำลังจะจัด";
  } else if (now >= startDate && now <= endDate) {
    status = "กำลังจัด";
  } else if (now > endDate) {
    status = "สิ้นสุดแล้ว";
  }

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

  const start_day = startDate.getDate();
  const start_month_index = startDate.getMonth();
  const start_year = startDate.getFullYear();

  const end_day = endDate.getDate();
  const end_month_index = endDate.getMonth();
  const end_year = endDate.getFullYear();

  const monthNames = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];

  const start_month_text = monthNames[start_month_index];
  const end_month_text = monthNames[end_month_index];

  const monthOptions: Intl.DateTimeFormatOptions = { month: "long" };

  const start_month_long = startDate.toLocaleDateString("th-TH", monthOptions);
  const end_month_long = endDate.toLocaleDateString("th-TH", monthOptions);

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
          className="capture relative max-w-2xl mx-auto md:pt-10 md:pb-10 pb-20 md:mb-10 pt-20 bg-gray-100 rounded-t-5xl rounded-b-xl flex flex-col gap-4"
        >
  
          <div className="px-4 md:px-10">
            {campaign.imageUrl &&
            <Image
              width={600}
              height={600}
              src={campaign.imageUrl} alt={campaign.name}
              className="w-full h-full object-cover rounded-2xl shadow border border-gray-100"
            />}
  
          </div>
  
          <div className="px-4 md:px-10">
            <div className="flex flex-row justify-between align-start gap-4 bg-white md:p-6 p-4 rounded-2xl shadow border border-gray-100">
              <div className="flex flex-col gap-3">
              <h1 className="text-sm font-bold">{campaign.name}</h1>
              <div className="flex items-center gap-3 text-gray-600">
                <FaRegCalendarCheck size={24} />
                <p className="text-sm text-gray-500">
                  ตั้งแต่ {start_day} - {end_day} {end_month_long} {end_year} นี้
                </p>
              </div>

              {campaign.pointCost > 0 && (
                <div className="flex flex-row item-center align-center gap-4">
                  <CiBitcoin size={24} />
                  <p>ใช้พอยต์: {campaign.pointCost}</p>
                </div>
              )}
              {campaign.pointEarn > 0 && (
                <div className="flex flex-row item-center align-center gap-4">
                  <CiBitcoin size={24} />
                  <p>ได้พอยต์: {campaign.pointEarn}</p>
                </div>
              )}
              {campaign.joinedCount > 0 && (
                <div className="flex flex-row item-center align-center gap-4">
                  <CiBitcoin size={24} />
                  <p className="text-gray-500 text-sm">ผู้เข้าร่วม: {campaign.joinedCount}</p>
                </div>
              )}
              {error && <p className="text-red-500">{error}</p>}
            </div>

            <div className="flex flex-col items-center gap-2">
              {session?.user?.id && (
                <FavoriteButton
                  targetId={campaign.id}
                  targetType="CAMPAIGN"
                  userId={session.user.id}
                />
              )}
              <button onClick={handleCapture}>
                <PiDotsThreeOutlineLight size={24} />
              </button>
              <ShareButton title={campaign.name} linkShare={campaign.linkShare} />
            </div>

          </div>
          
        </div>

       <div className="px-4 md:px-10">
          <div className="flex flex-col justify-between align-start gap-4 bg-white md:p-6 p-4 rounded-2xl shadow border border-gray-100">

          {/* Description */}
          {campaign.description && (
            <div>
              <h3 className="text-sm font-semibold mb-2">รายละเอียด</h3>
              <div
                 className="prose text-gray-700"
                dangerouslySetInnerHTML={{ __html: campaign.description }}
              />
            </div>
          )}

          </div>

        </div>

        <div className="px-4 md:px-10">
          <div className="flex flex-col justify-between align-start gap-4 bg-white md:p-6 p-4 rounded-2xl shadow border border-gray-100">
          {campaign.terms && (
            <div>
              <h3 className="text-sm font-semibold mb-2">เงื่อนไข</h3>
              <div
                className="prose text-sm"
                dangerouslySetInnerHTML={{ __html: campaign.terms }}
              />
            </div>
          )}
          </div>

        </div>

      {/* ✅ แสดงคูปองของแคมเปญ */}
      {campaign.coupons?.length > 0 && (
        <div className="px-4 md:px-10">
          <div className="flex flex-col justify-between align-start gap-4 bg-white md:p-6 p-4 rounded-2xl shadow border border-gray-100">
          <h3 className="text-sm font-semibold mb-2">คูปองในแคมเปญนี้</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {campaign.coupons.map((coupon) => {
              const now = new Date();

              // ✅ เช็กว่ามี start/end หรือไม่
              const startDate = new Date(coupon.startDate);
              const endDate = new Date(coupon.endDate);

              let status = "";
              if (startDate && endDate) {
                if (now < startDate) status = "กำลังจะจัด";
                else if (now >= startDate && now <= endDate) status = "กำลังจัด";
                else if (now > endDate) status = "สิ้นสุดแล้ว";
              }

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

                const start_day = startDate.getDate();
                const start_month_index = startDate.getMonth();
                const start_year = startDate.getFullYear();

                const end_day = endDate.getDate();
                const end_month_index = endDate.getMonth();
                const end_year = endDate.getFullYear();

                const monthNames = [
                  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
                  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
                ];

                const start_month_text = monthNames[start_month_index];
                const end_month_text = monthNames[end_month_index];

                const monthOptions: Intl.DateTimeFormatOptions = { month: "long" };

                const start_month_long = startDate.toLocaleDateString("th-TH", monthOptions);
                const end_month_long = endDate.toLocaleDateString("th-TH", monthOptions);

              const formatThaiDate = (date: Date) => {
                const d = date.getDate();
                const m = monthNames[date.getMonth()];
                const y = date.getFullYear() + 543; // ปี พ.ศ.
                return `${d} ${m} ${y}`;
              };

        return (
          <div className="embla__slide_campaign relative w-full" key={coupon.id}>

            <Link
              href={`/coupon/${coupon.id}`}
              className="w-full h-full flex flex-row p-0 rounded-xl overflow-hidden transition"
            >
              <div className="relative w-full h-full flex flex-col shadow-lg">
                <div className="relative w-full h-full flex flex-col gap-2 p-4 pb-2 bg-gray-100 rounded-2xl ticket-notch">
                  <div className="w-full">
                    {coupon.imageUrl && (
                      <Image
                        src={coupon.imageUrl}
                        alt={coupon.name}
                        width={100}
                        height={100}
                        className="w-full h-40 object-cover rounded-2xl shadow-lg"
                      />
                    )}
                  </div>

                  <div className="w-full" style={{ minHeight: "1.5rem" }}>
                      <h3 className="text-xs font-medium line-clamp-2 leading-tight">
                        {coupon.name}
                      </h3>
                    </div>
                    <div className="w-full mt-auto">
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {startDate.getDate()} - {endDate.getDate()} {monthNames[endDate.getMonth()]} {endDate.getFullYear()}
                      </p>
                    </div>

                </div>

                <div className="w-full flex flex-col gap-2 p-4  bg-gray-100 rounded-b-2xl border-t-2 border-black border-dotted">
                  
                  <button
                      className={`py-1 w-full rounded-full text-sm font-bold flex flex-row align-center justify-center gap-2 hover:bg-paseo-hover hover:text-black ${
                          status === "สิ้นสุดแล้ว"
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                              : "bg-paseo text-white"
                      }`}
                      disabled={status === "สิ้นสุดแล้ว"}
                  >
                      <RiCoupon2Fill size={20} />
                      {status === "สิ้นสุดแล้ว"
                          ? "สิ้นสุดแล้ว"
                          : Number(coupon.pointCost) === 0 // 👈 เปลี่ยนมาใช้ Number(coupon.pointCost) === 0
                              ? "รับสิทธิ์" 
                              : `ใช้ ${coupon.pointCost} พอยท์`
                      }
                  </button>

                </div>

              </div>
            </Link>
          </div>
        );
      })}
    </div>
  </div>
  </div>
)}

      </div>
    </div>
  );
}
