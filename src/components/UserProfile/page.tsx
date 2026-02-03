'use client';

import { useEffect, useState } from 'react';
import GreenCard from '@/components/GreenCard/page';
import { HiUserCircle } from "react-icons/hi2";
import Image from "next/image";
import Link from 'next/link';
import { RiCoupon2Fill } from "react-icons/ri";
import { TbCoinBitcoinFilled } from "react-icons/tb";
import Loading from '@/components/loading';

// Define the structure for a single coupon
interface CouponData {
  id: string;
  used: boolean;
  assignedAt: string;
  coupon: {
    id: string;
    code: string;
    name: string;
    expiresAt: string;
    imageUrl: string;
    activeCouponCount: string;
  };
}

// Update the UserProfileData interface to include the full coupons array
interface UserProfileData {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  branch?: { name: string };
  residenceType?: string;
  address: string;
  //houseNumber?: string;
  //alley?: string;
  subDistrict?: string;
  district?: string;
  postalCode?: string;
  avatar?: string;
  point: number;
  activeCouponCount: number;
  coupons: CouponData[]; // Changed from 'coupon: number' to 'coupons: CouponData[]'
  totalSpending: number;
  referralCode: string;
  referredBy?: string;
}

interface Props {
  showOn?: "mobile" | "desktop" | "both";
}

const getAvatarUrl = (avatar?: string) => {
  if (!avatar) return null;

  // ถ้าเป็น URL เต็ม (http หรือ https) → ใช้ได้เลย
  if (avatar.startsWith("http")) {
    return avatar;
  }

  // ถ้าเป็นแค่ชื่อไฟล์ → ชี้ไปที่ public/user/profile
  return `/user/profile/${avatar}`;
};

export default function UserProfile({ showOn = "mobile" }: Props) {
  const [user, setUser] = useState<UserProfileData | null>(null);

  const visibilityClass =
  showOn === "mobile"
    ? "block md:hidden"
    : showOn === "desktop"
    ? "hidden md:block"
    : "block";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/profile');
        const data = await res.json();
        if (data.user) setUser(data.user);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };
    fetchUser();
  }, []);

  if (!user) return 
    <Loading />
  ;

  const avatarUrl = getAvatarUrl(user.avatar);

  return (
  <div className={visibilityClass}>
    <GreenCard title="โปรไฟล์ของคุณ">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between w-full gap-2">
          <div className="w-50% z-10 flex flex-row text-center items-center gap-2 bg-white p-1 border border-gray-100 rounded-lg shadow-lg">
            <Link className="w-full flex flex-row items-center gap-1 text-lg font-semibold" href="/profile/point">
              <div className="md:pr-4 pr-2 border-r border-gray-400">
                <TbCoinBitcoinFilled className='text-paseo' size={20}/>
              </div>

              <div className="flex flex-row justify-center items-center w-full">
                <span className="text-xs leading-none font-semibold text-black">
                  {user.point} 
                  <span className="text-xs leading-none font-semibold text-black"> พอยท์</span>
                </span>
              </div>
              
              
            </Link>
          </div>

          <div className="w-50% z-10 flex flex-row text-center items-center gap-2 bg-white p-1 border border-gray-100 rounded-lg shadow-lg">
            <Link className="w-full flex flex-row items-center gap-1 text-lg font-semibold" href="/profile/coupon">
              <div className="md:pr-4 pr-2 border-r border-gray-400">
                <RiCoupon2Fill className='text-paseo' size={20} />
              </div>

              <div className="flex flex-row justify-center items-center w-full">
                <span className="text-xs leading-none font-semibold text-black">
                  {user.activeCouponCount} 
                  <span className="text-xs leading-none font-semibold text-black"> คูปอง</span>
                </span>
              </div>
              
            </Link>
          </div>
        </div>
              
              <div className="profile-card w-full text-white rounded-xl shadow-sm md:p-4 p-2 mb:p-6 gap-2 border border-gray-300 shadow-lg flex flex-row gap-4">

                  <div className="z-10 w-30% flex flex-col item-center gap-2">

                      <div className="w-full picture-section flex flex-row justify-center">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt={`${user.name}'s avatar`}
                            width={72}
                            height={72}
                            priority
                            className="rounded-full object-cover shadow-sm w-16 h-16 md:w-20 md:h-20 border border-gray-300 shadow"
                          />
                        ) : (
                            <HiUserCircle size={72} className="bg-white text-paseo rounded-full" />
                        )}
                      </div>
                      
                  </div>
      
                  <div className="z-10 w-70% flex flex-col gap-1">

                    <div className="w-full flex flex-col">
                        <p className="text-base font-semibold">{user.name}</p>
                    </div>

                    <div className="w-full flex flex-row gap-2">

                      <div className="w-50% flex flex-col">
                        <p className="text-xs leading-1 font-bold underline underline-offset-1">เบอร์โทรศัพท์​</p>
                        <p className="text-sm leading-none">{user.phone}</p>
                      </div>

                      <div className="w-50% flex flex-col">
                        <p className="text-xs leading-1 font-bold underline underline-offset-1">วันเกิด</p>
                        <p className="text-sm leading-none">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("th-TH") : "-"}</p>
                      </div>

                    </div>

                  </div>
                  
              </div>
          </div>

    </GreenCard>
  </div>
  );
}