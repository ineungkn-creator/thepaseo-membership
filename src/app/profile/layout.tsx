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
    <div className="max-w-2xl mx-auto md:pt-4 py-6 mb-20 mt-0 md:mt-20 md:mb-20 rounded-2xl">

      <HeaderMobile />

      <div className="md:hidden p-0 pt-8 md:mt-20 rounded-xl">
        <div className="w-full py-4 px-4 md:pt-0 md:px-20 md:pb-0">
          <UserProfile showOn="both" />
        </div>
      </div>

      <div className="w-full bg-white p-4 pt-4 md:p-10 md:pt-10 rounded-t-2xl rounded-xl">
        <MenuProfile />

        {/* 👇 ตรงนี้คือหน้าลูก */}
        <div className="pt-4">
          {children}
        </div>
      </div>
    </div>
  );
}
