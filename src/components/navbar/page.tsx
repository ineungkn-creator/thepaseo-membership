"use client";

import { useEffect, useState } from 'react';
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { IoTicketOutline } from "react-icons/io5";
import { MdControlPoint } from "react-icons/md";

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
  };
}

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
  subDistrict?: string;
  district?: string;
  postalCode?: string;
  avatar?: string;
  point: number;
  activeCouponCount: number;
  coupons: CouponData[];
  totalSpending: number;
  referralCode: string;
  referredBy?: string;
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

const Navbar = () => {
  const [user, setUser] = useState<UserProfileData | null>(null);
  const pathname = usePathname();

  const menuItems = [
    {
      label: "หน้าแรก",
      path: "/",
      icon: "/uploads/admin/navbar/icon_home.svg",
      iconActive: "/uploads/admin/navbar/icon_home_white.svg",
    },
    {
      label: "อัปโหลดใบเสร็จ",
      path: "/upload",
      icon: "/uploads/admin/navbar/icon_receipt.svg",
      iconActive: "/uploads/admin/navbar/icon_receipt_white.svg",
    },
    {
      label: "สิทธิพิเศษ",
      path: "/privilege",
      icon: "/uploads/admin/navbar/icon_gift.svg",
      iconActive: "/uploads/admin/navbar/icon_gift_white.svg",
    },
    {
      label: "Directory",
      path: "/directory",
      icon: "/uploads/admin/navbar/icon_shop.svg",
      iconActive: "/uploads/admin/navbar/icon_shop_white.svg",
    },
    {
      label: "Help",
      path: "/help",
      icon: "/uploads/admin/navbar/icon_help.svg",
      iconActive: "/uploads/admin/navbar/icon_help_white.svg",
    },
  ];

  const menuItemsMobile = [
    {
      label: "หน้าแรก",
      path: "/",
      icon: "/uploads/admin/navbar/icon_home.svg",
      iconActive: "/uploads/admin/navbar/icon_home_white.svg",
    },
    {
      label: "สะสมพอยท์",
      //path: "/collact-point",
      path: "/upload",
      icon: "/uploads/admin/navbar/icon_receipt.svg",
      iconActive: "/uploads/admin/navbar/icon_receipt_white.svg",
    },
    {
      label: "สิทธิพิเศษ",
      path: "/privilege",
      icon: "/uploads/admin/navbar/icon_gift.svg",
      iconActive: "/uploads/admin/navbar/icon_gift_white.svg",
    },
    {
      label: "Directory",
      path: "/directory",
      icon: "/uploads/admin/navbar/icon_shop.svg",
      iconActive: "/uploads/admin/navbar/icon_shop_white.svg",
    },
    {
      label: "โปรไฟล์",
      path: "/profile",
      icon: "/uploads/admin/navbar/icon_profile.svg",
      iconActive: "/uploads/admin/navbar/icon_profile_white.svg",
    },
    {
      label: "ช่วยเหลือ",
      path: "/help",
      icon: "/uploads/admin/navbar/icon_help.svg",
      iconActive: "/uploads/admin/navbar/icon_help_white.svg",
    },
  ];

  const isActivePath = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const getButtonClass = (path: string) => {
    const isActive = pathname === path;
    const baseClasses =
      "flex items-center space-x-1 transition-all duration-300 transform hover:scale-105";
    const activeClasses = "active-btn text-white bg-paseo scale-105 py-1 px-4 rounded-full";
    const inactiveClasses = "text-black rounded-full py-1 px-4 hover:text-white hover:bg-paseo-dark";

    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  const getMobileButtonClass = (path: string) => {
    const isActive = pathname === path;
    const baseClasses =
      "flex flex-col items-center flex-1 p-1 text-center transition-colors duration-200 rounded-lg hover:scale-105";
    // ใช้คลาสที่กำหนดไว้ใน config แทน
    const activeClasses = "text-white bg-paseo scale-105";
    const inactiveClasses = "text-black hover:text-black";

    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

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
  ;

  const avatarUrl = getAvatarUrl(user.avatar);

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        className="w-full hidden md:flex overflow-hidden mt-0 mb-5 p-0 text-black z-50 rounded-xl top-5 mx-auto shadow-sm"
      >
        <div className="fixed relarive w-full overflow-hidden flex flex-row flex-1 z-50 justify-between items-center blur py-2 px-4">
            <div className="flex flex-row justify-center gap-2 h-min w-25%">
              <Image
                priority={true}
                src="/logo.png"
                alt="Thepaseo"
                width={50}
                height={50}
              />
            </div>

            <div className="h-min flex flex-row nowarp gap-4 rounded-full p-2 pt-1 pb-1">
              {menuItems.map((item) => {
                const isActive = isActivePath(item.path);

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    prefetch={false}
                    className={getButtonClass(item.path)}
                  >
                    <Image
                      priority={true}
                      src={isActive ? item.iconActive : item.icon}
                      alt={item.label}
                      width={32}
                      height={32}
                    />
                    <p className="font-medium text-base whitespace-nowrap">{item.label}</p>
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-row justify-center items-center gap-2 w-25%">

              <div className="flex flex-row justify-between gap-2">
                <div className="z-10 flex flex-row text-center items-center gap-2 bg-white p-1 border border-gray-100 rounded-lg shadow-lg">
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

                <div className="z-10 flex flex-row text-center items-center gap-2 bg-white p-1 border border-gray-100 rounded-lg shadow-lg">
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

              <div className="">
                <Link 
                  key="/profile"
                  href="/profile"
                  className="w-full"
                >
                  <div className="w-12 h-12 picture-section flex flex-row justify-center">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={`${user.name}'s avatar`}
                        width={36}
                        height={36}
                        priority
                          className="rounded-full object-cover shadow-sm w-12 h-12"
                          unoptimized
                      />
                      ) : (
                        <img className="text-white" src="/uploads/admin/navbar/icon_profile.svg" alt="Thepaseo" width={36} height={36} />
                      )}
                    </div>
                </Link>
              </div>
            </div>
        </div>

      </nav>
      
      {/* Mobile Bottom Menu */}
      <nav className="md:hidden bg-white overflow-hidden fixed bottom-0 left-0 right-0 text-black rounded-t-xl shadow-sm border border-gray-200" style={{ zIndex:'51'}}>
        <div className="flex justify-around p-1">
          {menuItemsMobile.map((item) => {
            const isActive = isActivePath(item.path);

            return (
              <Link key={item.path} href={item.path} prefetch={false} className={getMobileButtonClass(item.path)}>
                <Image
                  priority={true}
                  src={isActive ? item.iconActive : item.icon}
                  alt={item.label}
                  width={24}
                  height={24}
                />
                <span className="text-10px mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navbar;