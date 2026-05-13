// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import UserProfile from '@/components/UserProfile/page';
import Loading from '@/components/loading';
import PrivilegeList from '@/components/PrivilegeList/page';
import HeaderMobile from "@/components/HeaderMobile/page";


export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    };
    fetchProfile();
  }, []);

  if (!user) {
    return (
        <Loading />
      );
  }

  return (
    <div className="max-w-2xl mx-auto p-0 px-0 mb-20 md:mt-20 mt-0 md:mb-0 mb-4 rounded-xl">
      <HeaderMobile />

      <div className="md:hidden p-0 pt-8 md:mt-20 -mb-16 rounded-xl">
        <div className="w-full pt-4 pb-0 px-4 md:pt-0 md:px-20 md:pb-0">
          <UserProfile showOn="both" />
        </div>
      </div>

      <div className="w-full bg-white  p-4 pt-20 md:p-10 md:mt-28 mt-6 md:pt-10 rounded-t-2xl">
        <h1 className="text-xl font-semibold mb-4">สิทธิพิเศษ</h1>
          <PrivilegeList />
      </div>
      
    </div>
  );
}
