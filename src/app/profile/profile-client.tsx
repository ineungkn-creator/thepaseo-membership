"use client";

import ProfileSetting from "@/components/ProfileSetting/page";
import ConnectLineButton from "@/components/ConnectLineButton/page";
import LogoutButton from "@/components/logoutbutton/page";
import Link from "next/link";
import { IoIosSettings } from "react-icons/io";
import { MdHelpCenter } from "react-icons/md";
import { SiPlatformdotsh } from "react-icons/si";

export default function ProfileClient({ user }: { user: any }) {
  return (
    <>
      <ProfileSetting />

      <div className="w-full flex flex-col gap-4 bg-gray-50 mt-4 p-4 mb:p-2 rounded-xl shadow border border-gray-100">
        <div className="flex items-center gap-2">
          <SiPlatformdotsh className="text-paseo" size={24}/>
          <span className="text-base font-bold">ผูกบัญชีกับแพลตฟอร์ม</span>
        </div>

        <div className="flex gap-4">
          <span className="text-xs whitespace-nowrap">ผูกมัดกับแพลตฟอร์ม</span>
          <ConnectLineButton />
        </div>
      </div>

      <div className="w-full flex flex-col gap-4 bg-gray-50 mt-4 p-4 mb:p-2 rounded-xl shadow border border-gray-100">
        <Link className="flex items-center gap-2" href="#">
          <IoIosSettings className="text-paseo" size={24} />
          <span className="text-xs">ตั้งค่า</span>
        </Link>
        <Link className="flex items-center gap-2" href="/help">
          <MdHelpCenter className="text-paseo" size={24} />
          <span className="text-xs">Help Center</span>
        </Link>
      </div>

      <div className="w-full bg-white my-4 mb-8 p-4 md:p-10 rounded-xl">
        <LogoutButton />
      </div>
    </>
  );
}
