'use client';

import { useEffect, useState } from 'react';
import GreenCard from '@/components/GreenCard/page';
import { RiCoupon2Fill } from "react-icons/ri";
import { MdVerified } from "react-icons/md";
import Link from 'next/link';
import Image from 'next/image';

import UseCouponModal from "@/components/coupon/UseCouponModal";

/* ==============================
   TYPES
============================== */
interface CouponData {
  id: string;
  used: boolean;
  status: "ACTIVE" | "USED" | "EXPIRED";
  assignedAt: string;
  coupon: {
    id: string;
    code: string;
    name: string;
    expiresAt: string;
    imageUrl: string;
  };
}

/* ==============================
   COMPONENT
============================== */
export default function CouponCard() {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);

  /* ==============================
     FETCH (ไม่ล้าง list ระหว่างโหลด)
  ============================== */
  const fetchCoupons = async (pageNumber: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profile/usercoupon?page=${pageNumber}`);
      const data = await res.json();

      setCoupons(data.items);            // ⭐ แทนที่ทั้งหน้า
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  /* โหลดเมื่อเปลี่ยนหน้า */
  useEffect(() => {
    fetchCoupons(page);
  }, [page]);

  /* ==============================
     RENDER
  ============================== */
  return (
    <>
      <GreenCard title="คูปองของฉัน">
        <div className="mt-4">

          {/* Coupon List */}
          {coupons.map((userCoupon) => (
            <div key={userCoupon.id} className="w-full mb-2 border md:p-4 p-2 rounded-lg">
              <div className="w-full flex flex-row items-start md:gap-4 gap-2">
                <div className="relative w-40% rounded-xl overflow-hidden">
                  <Image
                    src={userCoupon.coupon.imageUrl || "/main/no-image.png"}
                    alt={userCoupon.coupon.name}
                    width={ 500 }
                    height={ 500 }
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="w-60% flex flex-col md:gap-2 gap-1">

                  <p className="text-xs leading-5 font-semibold">{userCoupon.coupon.name}</p>

                  <p className="text-xs text-gray-500 text-left">
                    หมดอายุ:{" "}
                    {new Date(userCoupon.coupon.expiresAt).toLocaleDateString("th-TH")}
                  </p>

                  <div className="w-full items-start text-center gap-1 mt-1 p-2 rounded-lg bg-gray-100 border">
                    <p className="text-xs">{userCoupon.coupon.code}</p>
                  </div>
                  
                  

                  <div className="w-full text-center">
                    {userCoupon.status === "USED" && (
                      <span className="inline-flex items-center justify-center md:w-60% w-full px-3 md:py-2 py-1 bg-gray-300 text-gray-600 rounded-lg md:text-base text-sm gap-1">
                        <MdVerified size={16} /> ใช้แล้ว
                      </span>
                    )}

                    {userCoupon.status === "EXPIRED" && (
                      <span className="inline-flex items-center justify-center md:w-60% w-full px-3 md:py-2 py-1 bg-red-300 text-gray-700 rounded-lg md:text-base text-sm">
                        หมดอายุ
                      </span>
                    )}

                    {userCoupon.status === "ACTIVE" && (
                      <button
                        onClick={() => {
                          setSelectedCouponId(userCoupon.id);
                          setShowModal(true);
                        }}
                        className="inline-flex items-center justify-center md:w-60% w-full px-3 md:py-2 py-1 bg-paseo hover:bg-paseo-hover text-white rounded-lg md:text-base text-sm gap-1"
                      >
                        <RiCoupon2Fill size={16} />
                        <span className="text-xs whitespace-nowrap">ใช้คูปอง</span>
                      </button>
                    )}
                  </div>

                </div>
                
              </div>

              
            </div>
          ))}

          {/* Empty */}
          {!loading && coupons.length === 0 && (
            <p className="text-gray-500 text-center">
              ยังไม่มีคูปอง
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

      <UseCouponModal
        show={showModal}
        onClose={() => setShowModal(false)}
        userCouponId={selectedCouponId}
      />
    </>
  );
}
