"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import Loading from '@/components/loading';
import UserProfile from '@/components/UserProfile/page';
import HeaderMobile from '@/components/HeaderMobile/page';
import FavoriteButton from "@/components/FavoriteButton/page";

import { RiCoupon2Fill } from "react-icons/ri";

type Reward = {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  pointCost: string;
  participantCount: number;
  joined?: boolean;
};

export default function RewardPage() {
  const { data: session } = useSession();
  const [reward, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      const res = await fetch("/api/reward");
      const data = await res.json();
      setRewards(data);
      setLoading(false);
    };
    fetchRewards();
  }, []);

  if (loading) {
    return (
      <Loading />
    );
  }

  const monthNames = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
  ];

  return (
    <div>
      <HeaderMobile />
    
      <div className="max-w-2xl mx-auto p-0 -mb-14 md:mt-0 md:mb-16 rounded-xl">
        <div className="w-full md:pt-2 pt-16 px-10 md:px-20 md:pb-0">
          <UserProfile showOn="mobile" />
        </div>
      </div>

      <div className="relative max-w-2xl shadow-md mx-auto p-0 md:pt-0 pt-20 pb-4 mb-6 bg-white rounded-5xl rounded-b-xl">

        <div className="px-4 md:p-10 max-w-5xl mx-auto mb-6">
          <div className="flex flex-row justify-between mb-2">
            <h1 className="text-2xl font-bold mb-2">ของรางวัล</h1>
          </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 auto-rows-fr">
              
              {reward.map((r) => {
                const startDate = new Date(r.startDate);
                const endDate = new Date(r.endDate);
                const now = new Date();

                let status = "";
                if (now < startDate) status = "กำลังจะจัด";
                else if (now >= startDate && now <= endDate) status = "กำลังจัด";
                else status = "สิ้นสุดแล้ว";

                return (
                <Link key={r.id} href={`/reward/${r.id}`} className="relative border rounded-xl overflow-hidden hover:shadow-lg transition">
                  <div className="absolute flex justify-center top-5 left-5 w-10 h-10 rounded-full border border-gray-200 blur2 z-10">
                    {session?.user?.id && (
                      <FavoriteButton
                        targetId={r.id}
                        targetType="REWARD"
                        userId={session.user.id}
                      />
                    )}
                  </div>
                  <div className="relative w-full h-full flex flex-col">
                    <div className="relative w-full h-full flex flex-col gap-2 p-4 pb-2 bg-gray-100">
                        <div className="relative w-full rounded-xl overflow-hidden bg-white pt-125%">
                          <Image
                            src={r.imageUrl || "/main/no-image.png"}
                            alt={r.name}
                            fill
                            className="object-cover"
                            sizes="160px"
                          />
                        </div>
                      <div className="w-full" style={{ minHeight: "1.5rem" }}>
                        <h3 className="text-xs md:text-sm font-bold leading-5 tracking-wide">
                          {r.name}
                        </h3>
                      </div>

                      <div className="w-full mt-auto">
                        <p className="text-xs text-gray-600 line-clamp-1">
                          {startDate.getDate()} - {endDate.getDate()} {monthNames[endDate.getMonth()]} {endDate.getFullYear()}
                        </p>
                      </div>

                    </div>

                      <div className="w-full flex flex-col gap-2 p-4 bg-gray-100 border-t-2 border-black border-dotted">
                        <button
                          className={`py-1 w-full rounded-full text-sm md:text-base font-bold flex flex-row align-center justify-center items-center gap-2 hover:bg-paseo-hover hover:text-black ${
                            status === "สิ้นสุดแล้ว"
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                              : "bg-paseo text-white"
                            }`}
                          disabled={status === "สิ้นสุดแล้ว"}
                        >
                          <RiCoupon2Fill size={20} />
                          <span className="text-xs">
                            {status === "สิ้นสุดแล้ว"
                              ? "สิ้นสุดแล้ว"
                              : Number(r.pointCost) === 0
                              ? "รับสิทธิ์"
                              : `ใช้ ${r.pointCost} พอยท์`}
                          </span>
                        </button>
                      
                      </div>
                  </div>
                </Link>
                );
              })}
            </div>
        </div>
      </div>
    </div>
  );
}