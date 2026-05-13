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
    <div className="max-w-2xl mx-auto p-0 px-0 mb-20 md:mt-20 mt-0 md:mb-0 mb-4 rounded-xl">
      <HeaderMobile />

      <div className="md:hidden p-0 pt-8 md:mt-20 -mb-16 rounded-xl">
        <div className="w-full pt-4 pb-0 px-4 md:pt-0 md:px-20 md:pb-0">
          <UserProfile showOn="both" />
        </div>
      </div>

      <div className="w-full bg-white p-4 pt-16 md:p-10 md:mt-28 mt-6 md:pt-10 rounded-xl">
        <h1 className="text-xl font-semibold mb-4">ของรางวัล</h1>
      
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                
          {reward.map((r) => {
            const startDate = new Date(r.startDate);
            const endDate = new Date(r.endDate);
            const now = new Date();

            let status = "";
            if (now < startDate) status = "กำลังจะจัด";
            else if (now >= startDate && now <= endDate) status = "กำลังจัด";
            else status = "สิ้นสุดแล้ว";

            return (
              <div className="embla__slide_campaign relative w-full">
                <Link
                    key={r.id}
                    href={`/reward/${r.id}`}
                    className="w-full h-full flex flex-row p-0 rounded-xl overflow-hidden transition"
                  >
                  <div className="absolute flex justify-center top-6 left-6 w-10 h-10 rounded-full border border-gray-200 blur2 z-10">
                    {session?.user?.id && (
                      <FavoriteButton
                        targetId={r.id}
                        targetType="REWARD"
                        userId={session.user.id}
                      />
                    )}
                  </div>
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

      </div>

    </div>
  );
}