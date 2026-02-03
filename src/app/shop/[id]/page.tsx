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

  return (
    <div className="">
      <HeaderMobile />

      <div className="max-w-2xl mx-auto p-0rounded-xl">

        <div className="relative">

          <div className="w-full md:pt-4 pt-16 md:pt-0 md:px-20 md:pb-0 flex justify-center bg-gray-100">
            {shop.logoUrl && (
                <Image
                  src={shop.logoUrl}
                  alt={shop.name}
                  width={200}
                  height={200}
                  className="w-full object-cover rounded-lg"
                />
              )}
          </div>

          <div className="max-w-2xl mx-auto -mt-10 pt-6 px-6 pb-20 bg-white rounded-t-5xl rounded-b-xl shadow-xl relative z-50">
              <div className="flex flex-col justify-between align-start gap-4">
                <h1 className="text-2xl font-bold">{shop.name}</h1>

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

                <div className="flex flex-col w-full gap-4 mt-4">

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