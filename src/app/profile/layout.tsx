"use client";

import HeaderMobile from '@/components/HeaderMobile/page';
import UserProfile from "@/components/UserProfile/page";
import MenuProfile from "@/components/MenuProfile/page";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl mx-auto md:pt-4 pt-14 mb-20 md:mt-20 md:mb-20 rounded-2xl">

      <HeaderMobile />

      <div className="max-w-2xl mx-auto p-0 -mb-14 md:mt-0 md:-mb-16 rounded-xl">
        <div className="w-full pt-4 px-4 md:pt-0 md:px-20 md:pb-0">
          <UserProfile showOn="both" />
        </div>
      </div>

      <div className="w-full bg-white p-4 pt-16 md:p-10 md:pt-20 rounded-t-3xl rounded-xl">
        <MenuProfile />

        {/* 👇 ตรงนี้คือหน้าลูก */}
        <div className="pt-4">
          {children}
        </div>
      </div>
    </div>
  );
}
