// components/NewHomePage.tsx
'use client';

import { useState, useEffect } from 'react';

import UserProfile from '@/components/UserProfile/page';
import HomeTabPopup from '@/components/HomeTabPopup/page';
import HomePopup from '@/components/HomePopup/page';
import RewardList from '@/components/RewardList/page';
import EventList from '@/components/EventList/page';
import CampaignList from '@/components/CampaignList/page';
import CouponList from '@/components/CouponList/page';
import BannerHome from "@/components/BannerHome/page"
import HeaderMobile from '@/components/HeaderMobile/page';
import { AiOutlineExclamationCircle } from "react-icons/ai";

interface NewHomePageProps {
  user: {
    name: string | null;
    email: string | null;
    phone: string | null;
    point: number;
    referralCode: string | null;
    role: string;
    avatar: string | null;
    dateOfBirth: Date | null;
    gender: string | null;
    branch: string | null
    occupation: string | null;
  };
}

export default function NewHomePage({ user }: NewHomePageProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handlePopupOpen = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
  };

  useEffect(() => {
    if (!isPopupOpen) return;

    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [isPopupOpen]);



  return (
    <div className="max-w-2xl mx-auto p-0 mb-20 md:mt-10 md:mb-20 mb-4 rounded-xl">
      <HeaderMobile showBack={false} />

      <div className="md:hidden p-0 md:mt-20 mt-0 rounded-xl">
        <div className="w-full pt-12 pb-0 px-4 md:pt-0 md:px-20 md:pb-0">
          <UserProfile showOn="both" />
        </div>
      </div>
      
      <div className="md:mt-20 mt-0 mb-0 py-4 px-6 md:px-4">
        <BannerHome />
      </div>

      <div className="w-full pt-4 p-4 md:p-10 rounded-xl rounded-t-5xl bg-white relative shadow-sm">

        <div className="w-full mb-4 rounded-xl bg-white relative flex flex-col items-center">
          <button
            onClick={handlePopupOpen}
            className="bg-gray-100 px-2 py-1 rounded-full border border-gray-200"
          >
            <h3 className="text-xs text-gray-500 text-center flex gap-1 items-center">
              <AiOutlineExclamationCircle size={16} />
              BEST COMMUNITY MALL IN BANGKOK
            </h3>  
          </button>
          <HomeTabPopup
            isOpen={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
          />
        </div>

        
        <div className="p-0 max-w-5xl mx-auto mb-6">
          <CampaignList />
        </div>

        <div className="p-0 max-w-5xl mx-auto mb-6">
          <RewardList />
        </div>

        <div className="p-0 max-w-5xl mx-auto mb-6">
          <CouponList />
        </div>

        <div className="p-0 max-w-5xl mx-auto mb-6">
          <EventList />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"></div>
      </div>
      <HomePopup />
    </div>
  );
}