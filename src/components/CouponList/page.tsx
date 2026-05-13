"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import Loading from "@/components/loading";
import useEmblaCarousel from "embla-carousel-react";
import FavoriteButton from "@/components/FavoriteButton/page";

import { RiCoupon2Fill } from "react-icons/ri";

type Coupon = {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  pointCost: string;
};

export default function CouponList({ shopId }: { shopId?: string }) { // ✅ เพิ่ม prop
  const { data: session } = useSession();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel();

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        // ✅ ถ้ามี shopId ให้เรียกเฉพาะของร้านนั้น
        const url = shopId ? `/api/coupon?shopId=${shopId}` : `/api/coupon`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch coupons");
        const data = await res.json();
        setCoupons(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, [shopId]); // ✅ refetch เมื่อ shopId เปลี่ยน

  if (loading) return <Loading />;

  if (!coupons.length) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center">
        <p>คูปองหมด</p>
      </div>
    );
  }

  const monthNames = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
  ];

  return (
    <div className="p-0 max-w-5xl mx-auto mb-0">
      <div className="flex flex-row items-end justify-between mb-3">
        <span className="text-base font-bold">คูปอง</span>
        {!shopId && (
          <Link href="/coupon" className="bg-gray-100 px-2 py-1 rounded-full border border-gray-20 text-xs">
            ดูทั้งหมด
          </Link>
        )}
      </div>

      <section className="embla_post">
        <div className="embla__viewport_post rounded-lg" ref={emblaRef}>
          <div className="embla__container_post">
            {coupons.map((r) => {
              const startDate = new Date(r.startDate);
              const endDate = new Date(r.endDate);
              const now = new Date();

              let status = "";
              if (now < startDate) status = "กำลังจะจัด";
              else if (now >= startDate && now <= endDate) status = "กำลังจัด";
              else status = "สิ้นสุดแล้ว";
      
              return (
                <div
                  className="embla__slide_coupon relative w-full"
                  key={r.id}
                >
                  {/* ปุ่ม Favorite */}
                  <div className="absolute flex justify-center top-6 left-10 w-10 h-10 rounded-full border border-gray-200 blur2 z-10">
                    {session?.user?.id && (
                      <FavoriteButton
                        targetId={r.id}
                        targetType="COUPON"
                        userId={session.user.id}
                      />
                    )}
                  </div>

                  {/* Card เนื้อหา */}
                  <Link
                    href={`/coupon/${r.id}`}
                    className="w-full h-full flex flex-row p-0 rounded-xl overflow-hidden transition"
                  >
                    <div className="relative w-full h-full flex flex-col">
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
      </section>
    </div>
  );
}
