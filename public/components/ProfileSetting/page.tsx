// components/ProfileSetting/page.tsx
'use client';

import { useEffect, useState } from 'react';
import GreenCard from '@/components/GreenCard/page';
import { FaAddressCard } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import Link from 'next/link';
import Loading from '@/components/loading';

interface ProfileSettingData {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  branch?: { name: string };
  residenceType?: string;
  houseNumber?: string;
  alley?: string;
  subDistrict?: string;
  district?: string;
  postalCode?: string;
  avatar?: string;
  point: number;
  totalSpending: number;
  referralCode: string;
  referredBy?: string;
}

export default function ProfileSetting() {
  const [user, setUser] = useState<ProfileSettingData | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (data.user) setUser(data.user);
    };
    fetchUser();
  }, []);

  if (!user) return 
    <Loading />
  ;

  return (
    <GreenCard title="โปรไฟล์ของคุณ">
        <div className="profile-setting p-4 mb:p-2 bg-gray-50 rounded-xl shadow-sm">
            <div className="profile-setting-header flex flex-row justify-between items-center mb-4">
                <div className="profile-setting-header-1 flex flex-row items-center gap-2">
                    <FaAddressCard className="text-paseo" size={32}/>
                    <span className="text-base font-bold">แก้ไขข้อมูลส่วนตัว</span>
                </div>
                
                
                <div className="profile-setting-header-2 flex flex-row items-center gap-2">
                    <Link href="/profile/edit" className="flex items-center gap-1 text-sm font-bold">
                      <FaEdit className="text-paseo" size={20}/>
                      แก้ไข
                    </Link>
                </div>
            </div>

            <div className="profile-setting-items">
            
                <div className="profile-setting-item flex flex-row mb-2">
                    <h3 className="w-1/4 text-sm font-bold">ชื่อ</h3>
                    <span className="w-3/4 text-sm">{user.name!}</span>
                </div>

                <div className="profile-setting-item flex flex-row mb-2">
                    <h3 className="w-1/4 text-sm font-bold">อีเมลล์</h3>
                    <span className="w-3/4 text-sm">{user.email}</span>
                </div>

                <div className="profile-setting-item flex flex-row mb-2">
                    <h3 className="w-1/4 text-sm font-bold">วันเกิด</h3>
                    <span className="w-3/4 text-sm">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("th-TH") : "-"}</span>
                </div>

                <div className="profile-setting-item flex flex-row mb-2">
                    <h3 className="w-1/4 text-sm font-bold">เบอร์โทรศัพท์</h3>
                    <span className="w-3/4 text-sm">{user.phone}</span>
                </div>
            </div>
        </div>
    </GreenCard>
  );
}
