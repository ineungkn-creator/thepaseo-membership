'use client';

import { useEffect, useState } from 'react';
import GreenCard from '@/components/GreenCard/page';
import Link from 'next/link';
import Image from 'next/image';

import { RiCoupon2Fill } from "react-icons/ri";
import { MdVerified } from "react-icons/md";

/* ==============================
   TYPES
============================== */
interface RewardData {
  id: string;
  status: "ACTIVE" | "EXPIRED" | "REDEEMED";
  redeemed: boolean;
  joinedAt: string;
  reward: {
    id: string;
    name: string;
    imageUrl?: string;
    endDate?: string;
    pointCost?: number;
  };
}

/* ==============================
   COMPONENT
============================== */
export default function RewardCard() {
  const [rewards, setRewards] = useState<RewardData[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  /* ==============================
     FETCH
  ============================== */
  const fetchRewards = async (pageNumber: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profile/reward?page=${pageNumber}`);
      const data = await res.json();

      if (res.ok) {
        setRewards(data.items);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch rewards:", err);
    } finally {
      setLoading(false);
    }
  };

  /* โหลดเมื่อเปลี่ยนหน้า */
  useEffect(() => {
    fetchRewards(page);
  }, [page]);
  

  /* ==============================
     RENDER
  ============================== */
  return (
    <GreenCard title="รางวัลของฉัน">
      <div className="mt-4">

        {/* Reward List */}
        {rewards.map((reward) => (
          <div key={reward.id} className="w-full mb-2 border md:p-4 p-2 rounded-lg">
            <div className="w-full flex flex-row items-start md:gap-4 gap-2">
              <div className="relative w-40% rounded-xl overflow-hidden">
                <Image
                  src={reward.reward.imageUrl || "/main/no-image.png"}
                  alt={reward.reward.name}
                  width={ 500 }
                  height={ 500 }
                  className="object-cover"
                />
              </div>

              {/* Meta */}
              <div className="w-60% flex flex-col md:gap-2 gap-1">

                <p className="md:text-base text-sm leading-5 font-semibold">{reward.reward.name}</p>

                <p className="md:text-sm text-xs text-gray-500 text-left">
                    วันที่แลก:{" "}
                    {new Date(reward.joinedAt).toLocaleDateString("th-TH")}
                  </p>

                {reward.reward.endDate && (
                  <p className="md:text-sm text-xs text-gray-500 text-left">
                    หมดอายุ:{" "}
                    {new Date(reward.reward.endDate).toLocaleDateString("th-TH")}
                  </p>
                )}

                {/* Status */}
                <div className="w-full text-center">
                  {reward.status === "REDEEMED" && (
                    <span className="inline-flex items-center justify-center md:w-60% w-full px-3 md:py-2 py-1 bg-gray-300 text-gray-600 rounded-lg md:text-base text-sm gap-1">
                      <MdVerified size={16} /> ใช้แล้ว
                    </span>
                  )}

                  {reward.status === "EXPIRED" && (
                    <span className="inline-flex items-center justify-center md:w-60% w-full px-3 md:py-2 py-1 bg-red-300 text-gray-700 rounded-lg md:text-base text-sm">
                      หมดอายุ
                    </span>
                  )}

                  {reward.status === "ACTIVE" && (
                    <Link
                      href={`/profile/reward/${reward.id}`}
                      className="inline-flex items-center justify-center md:w-60% w-full px-3 md:py-2 py-1 bg-paseo hover:bg-paseo-hover text-white rounded-lg md:text-base text-sm gap-1"
                    >
                      <RiCoupon2Fill size={16} />
                      <span className="text-xs whitespace-nowrap">
                        ใช้รางวัล
                      </span>
                    </Link>
                  )}

                </div>

              </div>
              
            </div>

          </div>
        ))}

        {/* Empty */}
        {!loading && rewards.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            คุณยังไม่มีรางวัลที่แลกไว้
          </p>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <button
            disabled={page === 1 || loading}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-1 border rounded-xl disabled:opacity-50"
          >
            ◀ ก่อนหน้า
          </button>

          <span className="text-sm text-gray-600">
            หน้า {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages || loading}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-1 border rounded-xl disabled:opacity-50"
          >
            ถัดไป ▶
          </button>
        </div>

        {/* Loading (ไม่กระพริบ) */}
        {loading && (
          <p className="text-center text-xs text-gray-400 mt-3">
            กำลังโหลด...
          </p>
        )}
      </div>
    </GreenCard>
  );
}
