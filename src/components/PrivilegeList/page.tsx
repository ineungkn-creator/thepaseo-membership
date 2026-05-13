"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import FavoriteButton from "@/components/FavoriteButton/page";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { RiCoupon2Line, RiCoupon5Line } from "react-icons/ri";
import Loading from "@/components/loading";
import { BsClipboardCheck } from "react-icons/bs";
import { HiMiniSquares2X2 } from "react-icons/hi2";

type PrivilegeItem = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  participantCount: number;
  type: "CAMPAIGN" | "EVENT" | "COUPON" | "REWARD";
  startDate?: string;
  endDate?: string;
  pointCost?: number;
  createdAt?: string;
};

type Branch = {
  id: string;
  name: string;
  imageUrl?: string;
};

export default function PrivilegeCampaignList() {
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<PrivilegeItem[]>([]);
  const [events, setEvents] = useState<PrivilegeItem[]>([]);
  const [coupons, setCoupons] = useState<PrivilegeItem[]>([]);
  const [rewards, setRewards] = useState<PrivilegeItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"ALL" | "COUPON" | "REWARD">("ALL");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch Branches from API
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch("/api/shop/branch");
        if (!res.ok) throw new Error("Failed to fetch branches");
        const data = await res.json();

        // ❌ กรองสาขาที่ชื่อ "บางนา" ออก
        const filteredBranches = data.filter(
          (branch: Branch) => branch.name !== "บางนา"
        );

        // เพิ่ม “ทั้งหมด” ไว้ด้านหน้า
        setBranches([
          ...filteredBranches,
          { id: "all", name: "ทั้งหมด" },
        ]);

      } catch (err: any) {
        setError("ไม่สามารถโหลดข้อมูลสาขาได้");
      }
    };
    fetchBranches();
  }, []);

  // ✅ Fetch Privileges
  useEffect(() => {
    const fetchPrivileges = async () => {
      try {
        // ถ้าเป็นการโหลดครั้งแรก → loading เต็มหน้า
        if (loading) setLoading(true);
        // ถ้าไม่ใช่ครั้งแรก → แค่ refresh เฉย ๆ
        else setIsRefreshing(true);

        const url =
          selectedBranch && selectedBranch !== "all"
            ? `/api/privileges?branchId=${selectedBranch}`
            : "/api/privileges";
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch privileges");
        const data = await res.json();

        setCampaigns(data.campaigns);
        setEvents(data.events);
        setCoupons(data.coupons);
        setRewards(data.rewards);
      } catch (error) {
        console.error(error);
      } finally {
        // โหลดครั้งแรกจบ → setLoading false
        if (loading) setLoading(false);
        // โหลดซ้ำจบ → setIsRefreshing false
        setIsRefreshing(false);
      }
    };

    fetchPrivileges();
  }, [selectedBranch]);

  const [campaignEmblaRef] = useEmblaCarousel();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-10">{error}</p>;
  }

  // ✅ Branch Tabs (Dynamic from API)
  const renderBranchTabs = () => (
    <div className="flex justify-center gap-4 mb-4" role="tablist">
      {branches.map((branch) => (
        <button
          key={branch.id}
          onClick={() =>
            setSelectedBranch(branch.id === "all" ? null : branch.id)
          }
          className="flex flex-col items-center gap-3 transition h-full"
          aria-selected={selectedBranch === branch.id}
          role="tab"
        >
          {/* LOGO */}
          <div
            className={`w-20 h-20 p-2 aspect-square rounded-xl overflow-hidden flex items-center justify-center border transition
              ${
                selectedBranch === branch.id ||
                (!selectedBranch && branch.id === "all")
                  ? "bg-gray-50 border-paseo-dark"
                  : "bg-white border-gray-200"
              }`}
            >
            {branch.id === "all" ? (
              <Image
                src="/icon/icon-all.png"
                alt="all"
                width={40}
                height={40}
                className="w-full h-full object-contain"
                unoptimized
              />
            ) : branch.imageUrl ? (
              <Image
                src={
                  branch.imageUrl.startsWith("/")
                    ? branch.imageUrl
                    : branch.imageUrl.startsWith("http")
                    ? branch.imageUrl
                    : "/images/no-image.png"
                }
                alt={branch.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <Image
                src="/images/no-image.png"
                alt={branch.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                unoptimized
              />
            )}
          </div>

          {/* NAME */}
          <span className="text-xs md:text-sm font-semibold text-center leading-tight">
            {branch.name}
          </span>
        </button>
      ))}
    </div>
  );

  // Render carousel for Campaign
  const renderCampaignCarousel = () => (
    <div className="mb-8">
      <h2 className="text-lg font-bold mb-4">แคมเปญ</h2>
      {campaigns.length === 0 ? (
        <div className="p-6 text-center">
          <p>ยังไม่มีแคมเปญ</p>
        </div>
      ) : (
        <section className="embla_post">
          <div className="embla__viewport_post rounded-lg" ref={campaignEmblaRef}>
            <div className="embla__container_post">
              {campaigns.map((item) => (
                <div className="embla__slide_campaign relative w-full" key={item.id}>
                  <div className="absolute blur2 flex justify-center top-2 left-6 w-10 h-10 rounded-full border border-gray-200">
                    {session?.user?.id && (
                      <FavoriteButton
                        targetId={item.id}
                        targetType={item.type}
                        userId={session.user.id}
                      />
                    )}
                  </div>
                  <Link href={`/campaign/${item.id}`}>
                    <div className="embla__slide__number_campaign bg-gray-100 border rounded-2xl transition">
                      <div className="w-40%">
                        {item.imageUrl ? (
                          <Image
                            width={600}
                            height={600}
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full object-cover rounded-l-2xl"
                            unoptimized
                          />
                          ) : (
                            <Image
                              width={600}
                              height={600}
                              src='/main/no-image.png'
                              alt={item.name}
                              className="object-cover rounded-xl border bg-white p-6"
                              unoptimized
                            />
                          )}
                      </div>
                      <div className="flex flex-col flex-grow w-60% p-4 gap-2">
                        <h3 className="text-black text-base md:text-xl font-bold line-clamp-1">
                          {item.name}
                        </h3>
                        <div className="flex-grow">
                        <div
                            className="prose prose-ol:list-decimal prose-ol:pl-6 prose-ul:list-disc prose-ul:pl-6 text-xs md:text-sm text-gray-600 line-clamp-2 mb-2"
                            dangerouslySetInnerHTML={{
                            __html: item.description
                                ? item.description.length > 120
                                ? `${item.description.substring(0, 120)}...`
                                : item.description
                                : "<p>ยังไม่มีเงื่อนไข...</p>",
                            }}
                        />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );

  // Render Event section (grid layout)
  const renderEventSection = () => {
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

    return (
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">อีเวนต์</h2>
        {events.length === 0 ? (
          <div className="p-6 text-center">
            <p>ยังไม่มีอีเวนต์</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 auto-rows-fr">
            {events.map((r) => {
              const startDate = new Date(r.startDate!);
              const endDate = new Date(r.endDate!);
              const now = new Date();

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

              return (
                <div className=" relative w-full flex flex-col" key={r.id}>
                  <div className="absolute blur2 flex justify-center top-2 left-2 w-10 h-10 rounded-full shadow-sm border border-gray-200">
                    {session?.user?.id && (
                      <FavoriteButton
                        targetId={r.id}
                        targetType="EVENT"
                        userId={session.user.id}
                      />
                    )}
                  </div>
    
                  <Link
                    href={`/event/${r.id}`}
                    >
                    <div className="embla__slide__number_campaign bg-gray-100 border rounded-2xl transition flex items-stretch">
                      <div className="w-40%">
                        <Image
                          src={r.imageUrl || "/main/no-image.png"}
                          alt={r.name}
                          width={300}
                          height={300}
                          className="w-full h-full rounded-l-xl"
                          unoptimized
                        />
                      </div>

                    <div className="flex flex-col w-60% p-4 gap-2 justify-between">

                      <div className="pt-1 flex flex-col flex-grow gap-2">
                        <h3 className="text-xs font-semibold line-clamp-3 leading-4 text-start">
                          {r.name.length > 50 ? r.name.substring(0, 50) + "..." : r.name}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-2">
                          {startDate.getDate()} - {endDate.getDate()} {monthNames[endDate.getMonth()]} {endDate.getFullYear()}
                        </p>
                      </div>

                      <div className="px-4 md:px-8">

                      <button
                        className={`py-2 w-full rounded-full text-sm md:text-base font-bold flex flex-row align-center justify-center items-center gap-2 hover:bg-paseo-hover hover:text-black ${
                          status === "สิ้นสุดแล้ว"
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-paseo text-white"
                        }`}
                        disabled={status === "สิ้นสุดแล้ว"}
                      >
                        <BsClipboardCheck size={20} />
                        <span className="text-xs">
                          {status === "สิ้นสุดแล้ว" ? "สิ้นสุดแล้ว" : "เข้าร่วมกิจกรรม"}
                        </span>
                      </button>

                      </div>

                    </div>

                  </div>

                    
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Render Coupon/Reward section (grid layout)
  const renderCouponRewardSection = () => {
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

    const displayedItems =
      selectedType === "ALL"
        ? [...coupons, ...rewards].sort(
            (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
          )
        : selectedType === "COUPON"
        ? coupons
        : rewards;

    return (
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">คูปองและรางวัล</h2>
        <div className="flex justify-start gap-4 mb-4" role="tablist">

        {/* COUPON */}
        <button
          onClick={() => setSelectedType("COUPON")}
          className="flex flex-col items-center gap-3 transition"
          role="tab"
        >
          <div
            className={`w-20 h-20 p-2 rounded-xl flex items-center justify-center border transition
            ${
              selectedType === "COUPON"
                ? "bg-gray-50 border-paseo-dark"
                : "bg-white border-gray-200"
            }`}
          >
            <RiCoupon5Line size={36} className="text-paseo" />
          </div>

          <span className="text-xs md:text-sm font-semibold">
            คูปอง
          </span>
        </button>


        {/* REWARD */}
        <button
          onClick={() => setSelectedType("REWARD")}
          className="flex flex-col items-center gap-3 transition"
          role="tab"
        >
          <div
            className={`w-20 h-20 p-2 rounded-xl flex items-center justify-center border transition
            ${
              selectedType === "REWARD"
                ? "bg-gray-50 border-paseo-dark"
                : "bg-white border-gray-200"
            }`}
          >
            <RiCoupon2Line size={36} className="text-paseo" />
          </div>

          <span className="text-xs md:text-sm font-semibold">
            รางวัล
          </span>
        </button>

        {/* ALL */}
        <button
          onClick={() => setSelectedType("ALL")}
          className="flex flex-col items-center gap-3 transition"
          role="tab"
        >
          <div
            className={`w-20 h-20 p-2 rounded-xl flex items-center justify-center border transition
            ${
              selectedType === "ALL"
                ? "bg-gray-50 border-paseo-dark"
                : "bg-white border-gray-200"
            }`}
          >
            <Image
              src="/icon/icon-all.png"
              alt="all"
              width={40}
              height={40}
              className="w-full h-full object-contain"
              unoptimized
            />
          </div>

          <span className="text-xs md:text-sm font-semibold">
            ทั้งหมด
          </span>
        </button>

      </div>
        {displayedItems.length === 0 ? (
          <div className="p-6 text-center">
            <p>
              {selectedType === "ALL"
                ? "ยังไม่มีคูปองหรือรางวัล"
                : selectedType === "COUPON"
                ? "ยังไม่มีคูปอง"
                : "ยังไม่มีของรางวัล"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {displayedItems.map((r) => {
              const startDate = new Date(r.startDate!);
              const endDate = new Date(r.endDate!);
              const now = new Date();

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

              return (
                <div className="embla__slide_campaign relative w-full" key={`${r.type}-${r.id}`}>
                  <Link
                    href={`/${r.type.toLowerCase()}/${r.id}`}
                    className="w-full h-full flex flex-row p-0 rounded-xl overflow-hidden transition"
                  >
                    <div className="relative w-full h-full flex flex-col shadow-lg">
                      <div className="relative w-full h-full flex flex-col">
                        <div className="w-full aspect-square rounded-xl overflow-hidden bg-white p-3 bg-gray-100">
                          <Image
                            src={r.imageUrl || "/main/no-image.png"}
                            alt={r.name}
                            width={300}
                            height={300}
                            className="w-full h-full rounded-xl"
                            unoptimized
                          />
                        </div>

                        <div className="w-full rounded-xl flex flex-col gap-2 bg-white p-2 bg-gray-100">

                          <div className="w-full px-1" style={{ minHeight: "2rem" }}>
                            <h3 className="text-xs font-semibold line-clamp-3 leading-4 text-center">
                              {r.name.length > 40 ? r.name.substring(0, 40) + "..." : r.name}
                            </h3>
                          </div>

                          <button
                            className={`py-1 w-full rounded-full text-xs md:text-sm font-bold flex flex-row items-center justify-center gap-2 hover:text-black ${
                              status === "สิ้นสุดแล้ว"
                                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                : "bg-paseo text-white"
                            }`}
                            disabled={status === "สิ้นสุดแล้ว"}
                          >
                            {status === "สิ้นสุดแล้ว"
                              ? "สิ้นสุดแล้ว"
                              : Number(r.pointCost) === 0
                              ? "รับสิทธิ์"
                              : `${r.pointCost} พอยท์`}
                          </button>
                        </div>
                      </div>

                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-0 max-w-5xl mx-auto mb-6">

      {renderBranchTabs()}

      {/* Campaign Section */}
      {renderCampaignCarousel()}

      {/* Coupon/Reward Section */}
      {renderCouponRewardSection()}

      {/* Event Section */}
      {renderEventSection()}
    </div>
  );
}