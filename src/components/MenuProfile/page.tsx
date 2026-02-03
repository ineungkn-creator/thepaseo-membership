"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { RiCoupon2Line } from "react-icons/ri";
import { MdOutlineControlPointDuplicate } from "react-icons/md";
import { MdCurrencyExchange } from "react-icons/md";
import { IoHeartSharp } from "react-icons/io5";
import { FaHistory } from "react-icons/fa";

const MenuProfile = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      label: "คูปอง",
      path: "/profile/coupon",
      icon: <RiCoupon2Line className="mb-1" size={24} />,
    },
    {
      label: "แลก",
      path: "/profile/reward",
      icon: <MdCurrencyExchange className="mb-1" size={24} />,
    },
    {
      label: "ชื่นชอบ",
      path: "/favorite",
      icon: <IoHeartSharp className="mb-1" size={24} />,
    },
    {
      label: "สะสมพ้อยท์",
      path: "/profile/upload",
      icon: <MdOutlineControlPointDuplicate className="mb-1" size={24} />,
    },
    {
      label: "ประวัติพอยท์",
      path: "/profile/point",
      icon: <FaHistory className="mb-1" size={24} />,
    },
  ];

  const getButtonClass = (path: string) => {
    const normalizedPathname = pathname.replace(/\/$/, "");
    const normalizedPath = path.replace(/\/$/, "");
    const isActive = normalizedPathname === normalizedPath;

    const baseClasses =
      "profile-menu-item flex-1 flex flex-col items-center pt-4 pb-2 p-1 bg-white border border-gray-200 rounded-xl shadow-md transition-all";

    const activeClasses = "bg-paseo border-black text-white";
    const inactiveClasses = "text-black hover:text-black hover:bg-gray-100 hover:shadow-lg";

    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  const getIconColor = (path: string) => {
    const normalizedPathname = pathname.replace(/\/$/, "");
    const normalizedPath = path.replace(/\/$/, "");
    const isActive = normalizedPathname === normalizedPath;

    return isActive ? "text-white" : "text-paseo"; // เปลี่ยนสี icon ตามสถานะ
  };

  return (
    <nav className="profile-btn flex flex-row gap-2 mb:gap-5 justify-center mb-4">
      {menuItems.map((item) => {
        const isActive = pathname.replace(/\/$/, "") === item.path.replace(/\/$/, "");
        const isFavorite = item.path === "/favorite";
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`${getButtonClass(item.path)} ${isFavorite ? "hidden md:flex" : ""}`}
          >
            {/* ใช้ React.cloneElement เพื่อเพิ่ม className ให้ icon */}
            {React.cloneElement(item.icon, {
              className: `mb-1 ${getIconColor(item.path)}`,
            })}
            <p className={`md:text-xs text-10px text-center ${isActive ? "text-white" : "text-black"}`}>
              {item.label}
            </p>
          </Link>
        );
      })}
    </nav>
  );
};

export default MenuProfile;