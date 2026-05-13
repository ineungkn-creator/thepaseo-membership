'use client';

import { useEffect, useState } from 'react';
import GreenCard from '@/components/GreenCard/page';
import { HiUserCircle } from "react-icons/hi2";
import Image from "next/image";
import Link from 'next/link';
import { IoTicketOutline } from "react-icons/io5";
import { MdControlPoint } from "react-icons/md";
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

export function formatPhone(phone?: string) {
  if (!phone) return "";

  const cleaned = phone.replace(/\D/g, "");

  // เบอร์มือถือ 10 หลัก
  if (cleaned.length === 10 && cleaned.startsWith("0")) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }

  // เบอร์บ้าน 9 หลัก
  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{4})/, "$1-$2-$3");
  }

  return phone;
}

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
          
          <div className="profile-card w-full text-white rounded-xl shadow-sm md:p-4 px-3 py-3 mb:p-6 gap-0 border border-gray-300 shadow-lg flex flex-row">

              <div className="flex flex-col item-center gap-1 z-10">

                  <div className="w-20 h-20 picture-section flex flex-row justify-center">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={`${user.name}'s avatar`}
                        width={72}
                        height={72}
                        priority
                        className="rounded-full object-cover shadow-sm w-20 h-20 md:w-20 md:h-20"
                        unoptimized
                      />
                    ) : (
                        <HiUserCircle size={72} className="bg-white text-paseo rounded-full" />
                    )}
                  </div>
                  
              </div>

              <div className="w-full flex flex-col gap-3 z-10 ">

                <div className="w-full flex flex-col ml-2">
                  <p className="text-xl font-semibold">{user.name}</p>
                  <div className="w-full flex flex-row items-center gap-2">
                    <p className="text-xs font-medium leading-none">เบอร์โทรศัพท์</p>
                    <p className="text-xs font-semibold leading-none">
                      {formatPhone(user.phone)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between w-full gap-3">
                  <div className="w-50% z-10 flex flex-row text-center items-center gap-2 bg-white p-1 border border-gray-100 rounded-lg shadow-lg">
                    <Link className="w-full flex flex-row items-center gap-2 text-lg font-semibold" href="/profile/point">
                      <MdControlPoint className='text-black' size={24} />

                      <div className="flex flex-col justify-center items-start w-full gap-1">
                        <span className="text-xs leading-none font-medium text-black">พอยท์</span>
                        <span className="text-xs leading-none font-semibold text-black">
                          {user.point.toLocaleString()} พอยท์
                        </span>
                      </div>
                      
                      
                    </Link>
                  </div>

                  <div className="w-50% z-10 flex flex-row text-center items-center gap-2 bg-white p-1 border border-gray-100 rounded-lg shadow-lg">
                    <Link className="w-full flex flex-row items-center gap-2 text-lg font-semibold" href="/profile/coupon">
                      <IoTicketOutline className='text-black' size={24} />

                      <div className="flex flex-col justify-center items-start w-full gap-1">
                        <span className="text-xs leading-none font-medium text-black">คูปอง</span>
                        <span className="text-xs leading-none font-semibold text-black">
                          {user.activeCouponCount} ใบ
                        </span>
                      </div>
                      
                    </Link>
                  </div>
                </div>

              </div>
              
          </div>

        </div>

      </GreenCard>
    </div>
  );
}