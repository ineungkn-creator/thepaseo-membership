"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
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

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center">
        <p>กำลังโหลด...</p>
      </div>
    );
  }

  if (!coupons.length) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center">
        <p>คูปองหมด</p>
      </div>
    );
  }

  return (
    <div className="p-0 max-w-5xl mx-auto mb-0">
      <div className="flex flex-row justify-between mb-4">
        <h1 className="text-xl font-bold">คูปอง</h1>
        {!shopId && (
          <Link href="/coupon" className="text-base">
            ดูทั้งหมด
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {coupons.map((r) => {
          const startDate = new Date(r.startDate);
          const endDate = new Date(r.endDate);
          const now = new Date();

          let status = "";
          if (now < startDate) status = "กำลังจะจัด";
          else if (now >= startDate && now <= endDate) status = "กำลังจัด";
          else status = "สิ้นสุดแล้ว";

          const monthNames = [
            "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
            "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
          ];

          return (
            <div className="embla__slide_campaign relative w-full" key={r.id}>
              <Link
                href={`/coupon/${r.id}`}
                className="w-full h-full flex flex-row p-0 rounded-xl overflow-hidden transition"
              >
                <div className="relative w-full h-full flex flex-col shadow-lg">
                  <div className="relative w-full h-full flex flex-col gap-2 p-4 pb-2 bg-gray-100 rounded-2xl ticket-notch">
                    {r.imageUrl ? (
                      <Image
                        width={600}
                        height={600}
                        src={r.imageUrl}
                        alt={r.name}
                        className="h-40 object-cover rounded-xl"
                      />
                    ) : (
                        <Image
                          width={600}
                          height={600}
                          src='/main/no-image.png'
                          alt={r.name}
                          className="h-40 object-cover rounded-xl border bg-white p-6"
                        />
                    )}
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

                  <div className="w-full flex flex-col gap-2 p-4 bg-gray-100 rounded-b-2xl border-t-2 border-black border-dotted">
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
