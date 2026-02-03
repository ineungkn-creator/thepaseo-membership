"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";

type Role = "USER" | "ADMIN" | "ADMINMARKETING" | "CRMMANAGEMENT" | "STAFF";

interface AdminBarProps {
  session?: Session | null;
}

const AdminBar = ({ session: propSession }: AdminBarProps) => {
  const { data: sessionData } = useSession();
  const pathname = usePathname();
  const session = sessionData ?? propSession;
  const role = session?.user?.role ?? "USER";
  const permissions = session?.user?.permissions ?? [];

  // ซ่อน AdminBar ทั้งหมดสำหรับ Role USER
  if (role === "USER") {
    return null;
  }

  // อนุญาตให้แสดง AdminBar เฉพาะ Role ADMIN และ CRMMANAGEMENT
  if (!["ADMIN", "ADMINMARKETING", "CRMMANAGEMENT", "STAFF"].includes(role)) {
    return null;
  }

  const menuItems = [
    {
      label: "หน้าแอดมิน",
      path: "/admin",
      roles: ["ADMIN", "ADMINMARKETING", "CRMMANAGEMENT", "STAFF"],
      permission: undefined,
    },
  ];

  const filteredMenu = menuItems.filter(
    (item) =>
      (!item.roles || item.roles.includes(role)) &&
      (!item.permission || permissions.includes(item.permission))
  );

  const getButtonClass = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center gap-2 transition-all duration-300 transform ${
      isActive
        ? "text-white bg-paseo scale-105 pt-1 pb-1 pl-4 pr-4 rounded-full"
        : "text-black pt-1 pb-1 pl-4 pr-4 rounded-full"
    }`;
  };

  const getMobileButtonClass = (path: string) => {
    const isActive = pathname === path;
    return `flex flex-row gap-2 items-start text-center transition-colors duration-200 rounded-lg ${
      isActive ? "text-white bg-paseo scale-105" : "text-white"
    }`;
  };

  return (
    <div
      className="bg-black fixed top-0 left-0 right-0 text-white"
      style={{ zIndex: 49 }}
    >
      <div className="flex flex-row gap-2 justify-start p-1">
        {filteredMenu.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={getMobileButtonClass(item.path)}
          >
            <span className="text-xs text-white">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminBar;