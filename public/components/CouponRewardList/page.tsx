// components/CouponRewardList.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { RiCoupon2Fill, RiCoupon2Line, RiCoupon5Line } from "react-icons/ri";
import { TbBorderAll } from "react-icons/tb";

type Coupon = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  pointCost: string;
};

type Reward = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  pointCost: string;
};

type Tab = "all" | "coupon" | "reward";

export default function CouponRewardList() {
  const { data: session } = useSession();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch coupons
        const couponRes = await fetch("/api/coupon");
        if (!couponRes.ok) throw new Error("Failed to fetch coupons");
        const couponData = await couponRes.json();
        setCoupons(couponData);

        // Fetch rewards
        const rewardRes = await fetch("/api/reward");
        if (!rewardRes.ok) throw new Error("Failed to fetch rewards");
        const rewardData = await rewardRes.json();
        setRewards(rewardData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Combine coupons and rewards for the "All" tab
  const allItems = [
    ...coupons.map((item) => ({ ...item, type: "coupon" })),
    ...rewards.map((item) => ({ ...item, type: "reward" })),
  ];

  // Filter items based on active tab
  const displayedItems =
    activeTab === "all"
      ? allItems
      : activeTab === "coupon"
      ? coupons.map((item) => ({ ...item, type: "coupon" }))
      : rewards.map((item) => ({ ...item, type: "reward" }));

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center">
        <p>กำลังโหลด...</p>
      </div>
    );
  }

  if (!allItems.length) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center">
        <p>ไม่มีคูปองหรือรางวัล</p>
      </div>
    );
  }

  return (
    <div className="p-0 max-w-5xl mx-auto mb-6">
      {/* Tab Navigation */}
      <div className="flex flex-row justify-between mb-4">
        <h1 className="text-xl font-bold">คูปองและรางวัล</h1>
      </div>
      <div className="flex space-x-4 mb-4">
        <button
          className={`flex flex-col py-2 px-4 w-20% rounded-xl flex items-center gap-1 ${
            activeTab === "all" ? "bg-paseo text-white" : "bg-gray-200 text-gray-600"
          }`}
          onClick={() => setActiveTab("all")}
        >
          <TbBorderAll size={32} />
          <span className="text-sm">ทั้งหมด</span>
        </button>
        <button
          className={`flex flex-col py-2 px-4 w-20% rounded-xl flex items-center gap-1 ${
            activeTab === "coupon" ? "bg-paseo text-white" : "bg-gray-200 text-gray-600"
          }`}
          onClick={() => setActiveTab("coupon")}
        >
          <RiCoupon2Line size={32} />
          <span className="text-sm">คูปอง</span>
        </button>
        <button
          className={`flex flex-col py-2 px-4 w-20% rounded-xl flex items-center gap-1 ${
            activeTab === "reward" ? "bg-paseo text-white" : "bg-gray-200 text-gray-600"
          }`}
          onClick={() => setActiveTab("reward")}
        >
          <RiCoupon5Line size={32} />
          <span className="text-sm">รางวัล</span>
        </button>
      </div>

      {/* Item Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {displayedItems.map((r, index) => {
          const startDate = new Date(r.startDate);
          const endDate = new Date(r.endDate);
          const now = new Date();

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
            <div className="embla__slide_campaign relative w-full" key={`${r.type}-${r.id}`}>
              <Link
                href={`/${r.type}/${r.id}`}
                className="w-full h-full flex flex-row p-0 rounded-xl overflow-hidden transition"
              >
                <div className="relative w-full h-full flex flex-col shadow-lg">
                  <div className="relative w-full h-full flex flex-col gap-2 p-4 pb-2 bg-gray-100 rounded-2xl ticket-notch">
                    <div className="w-full">
                      {r.imageUrl && (
                        <Image
                          src={r.imageUrl}
                          alt={r.name}
                          width={100}
                          height={100}
                          className="w-full h-40 object-cover rounded-lg shadow-lg"
                        />
                      )}
                    </div>

                    <div className="w-full" style={{ height: "2rem" }}>
                      <h3 className="text-xs font-medium line-clamp-1 mb-2">{r.name}</h3>
                    </div>
                    <div className="w-full mt-4 md:mt-0" style={{ height: "1rem" }}>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {start_day} - {end_day} {end_month_long} {end_year}
                      </p>
                    </div>
                  </div>

                  <div className="w-full flex flex-col gap-2 p-4 bg-gray-100 rounded-b-2xl border-t-2 border-black border-dotted">
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
                        : Number(r.pointCost) === 0
                        ? "รับสิทธิ์"
                        : `ใช้ ${r.pointCost} พอยท์`}
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}