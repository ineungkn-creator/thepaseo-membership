// app/shop/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from "next/image";
import HeaderMobile from '@/components/HeaderMobile/page';
import Loading from '@/components/loading';
import CouponList from '@/components/CouponList/page';
import EventList from '@/components/EventList/page';
import RewardList from '@/components/RewardList/page';
import { getShopStatus } from "@/lib/shopHours"

import { FaPhoneAlt } from "react-icons/fa";

interface Reward {
  id: string;
  name: string;
  imageUrl: string;
  description: string | null;
  pointCost: number | null;
  pointEarn: number | null;
  quantity: number | null;
  maxPerUser: number | null;
  startDate: string;
  endDate: string;
  participantCount: number;
}

interface Coupon {
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

interface Event {
  id: string;
  name: string;
  imageUrl: string;
  description: string | null;
  startDate: string;
  endDate: string;
  registrations: number;
}

interface Shop {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  hours: any[];
  logoUrl: string | null;
  imageUrl: string | null;
  zone: string;
  location: string;
  category: { id: string; name: string } | null;
  branch: { id: string; name: string } | null;
  rewards: Reward[];
  coupon: Coupon[];
  event: Event[];
}

export default function ShopPage() {
  const { id } = useParams();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShop() {
      try {
        const response = await fetch(`/api/shop/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch shop');
        }
        const data = await response.json();
        setShop(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchShop();
  }, [id]);

  if (loading) return 
    <Loading />
  ;
  if (error) return <div>Error: {error}</div>;
  if (!shop) return <div>Shop not found</div>;
  const status = getShopStatus(shop.hours)
  const today = new Date().getDay()

  return (
    <div className="md:pt-4 pt-16">
      <HeaderMobile />

      <div className="max-w-2xl mx-auto p-0rounded-xl">

        <div className="relative">

          <div className="max-w-2xl mx-auto p-0 px-0 mb-0 md:mt-20 md:mb-0 rounded-xl">
            {shop.imageUrl && (
                <Image
                  src={shop.imageUrl}
                  alt={shop.name}
                  width={200}
                  height={200}
                  className="w-full object-cover rounded-lg"
                  unoptimized
                />
              )}
          </div>

          <div className="max-w-2xl mx-auto -mt-10 pt-6 px-6 pb-20 bg-white rounded-t-xl rounded-b-xl shadow-xl relative z-49">
              <div className="flex flex-col justify-between align-start gap-2">
                <h1 className="text-2xl font-bold">{shop.name}</h1>

                <div className="flex flex-row items-center justify-between">
                {status && (
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        status.open
                          ? "bg-paseo text-white"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {status.open ? "เปิดอยู่" : "ปิดอยู่"}
                    </span>

                    <span className="text-sm text-gray-600">
                      {status.open
                        ? `ปิด ${status.closeTime}`
                        : `เปิด ${status.openTime}`}
                    </span>
                  </div>
                )}

                <div className="flex gap-4">

                  {shop.phone && (
                    <a
                      href={`tel:${shop.phone}`}
                      className="flex items-center justify-center gap-2
                      bg-paseo-hover text-paseo-dark font-medium  text-sm
                      py-1.5 px-2 rounded-full 
                      hover:opacity-90 transition"
                    >
                      <FaPhoneAlt size={24} className="text-white p-1.5  bg-paseo-dark rounded-full" />
                      {shop.phone}
                    </a>
                  )}

                </div>

                </div>

                

                <div className="flex flex-row w-full gap-4 mt-4">

                  {shop.branch && (
                    <div className="relative flex flex-row w-full bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg shadow-sm">
                      <p className="absolute -top-2 left-1 text-xs text-black font-semibold bg-paseo-hover border border-paseo-dark py-0 px-2 rounded-md">สาขา</p>
                      <p className="mt-4 text-xs text-gray-600">{shop.branch?.name || '-'}</p>
                    </div>
                  )}

                  {shop.category && (
                    <div className="relative flex flex-row w-full bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg shadow-sm">
                      <p className="absolute -top-2 left-1 text-xs text-black font-semibold bg-paseo-hover border border-paseo-dark py-0 px-2 rounded-md">ประเภท</p>
                      <p className="mt-4 text-xs text-gray-600">{shop.category?.name || '-'}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-row w-full gap-4 mt-4">

                  {shop.zone && (
                    <div className="relative flex flex-row w-full bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg shadow-sm">
                      <p className="absolute -top-2 left-1 text-xs text-black font-semibold bg-paseo-hover border border-paseo-dark py-0 px-2 rounded-md">โซน</p>
                      <p className="mt-4 text-xs text-gray-600">{shop.zone || '-'}</p>
                    </div>
                  )}

                  {shop.location && (
                    <div className="relative flex flex-row w-full bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg shadow-sm">
                      <p className="absolute -top-2 left-1 text-xs text-black font-semibold bg-paseo-hover border border-paseo-dark py-0 px-2 rounded-md">ที่ตั้ง</p>
                      <p className="mt-4 text-xs text-gray-600">{shop.location || "-"}</p>
                    </div>
                  )}

                </div>

                <div className="flex flex-row w-full gap-4 mt-4">
                  {shop.hours && shop.hours.length > 0 && (
                    <div className="relative flex flex-col w-full bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg shadow-sm">
                      
                      <p className="absolute -top-2 left-1 text-xs text-black font-semibold bg-paseo-hover border border-paseo-dark py-0 px-2 rounded-md">
                        เวลาเปิดทำการ
                      </p>

                      <div className="mt-4 text-xs text-gray-600 space-y-1">
                        {shop.hours.map((h:any) => {
                          const days = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัส","ศุกร์","เสาร์"]

                          return (
                            <div
                              key={h.dayOfWeek}
                              className={`flex justify-between ${
                                today === h.dayOfWeek ? "font-bold text-paseo-dark" : ""
                              }`}
                            >
                              <span>{days[h.dayOfWeek]}</span>

                              {h.isClosed ? (
                                <span className="text-gray-400">ปิด</span>
                              ) : (
                                <span>
                                  {h.openTime} - {h.closeTime}
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {shop.description && 
                  <div className="mb-2">
                    <p className="text-base text-gray-700 mt-2">รายละเอียด</p>
                    <div
                      className="prose text-base mb-2 prose-ol:list-decimal prose-ol:pl-6 prose-ul:list-disc prose-ul:pl-6"
                      dangerouslySetInnerHTML={{ __html: shop.description }}
                    />
                  </div>
                }

              </div>
            </div>

            <div className="p-4 px-4 pt-0 md:p-10 md:pt-0 flex flex-col gap-4">

              {shop.rewards && shop.rewards.length > 0 && (
                <section className="flex flex-col justify-between align-start gap-4 bg-white p-4 rounded-2xl shadow-md">
                  
                  <RewardList shopId={id as string} />
                    
                </section>
              )}

              {shop.coupon && shop.coupon.length > 0 && (
                <section className="flex flex-col justify-between align-start gap-4 bg-white p-4 rounded-2xl shadow-md">
                  
                  <CouponList shopId={id as string} />
                    
                </section>
              )}

              {shop.event && shop.event.length > 0 && (
                <section className="flex flex-col justify-between align-start gap-4 bg-white p-4 rounded-2xl shadow-md">
                  
                  <EventList shopId={id as string} />
                    
                </section>
              )}
            </div>

          </div>

          
      </div>
          
    </div>
  );
}