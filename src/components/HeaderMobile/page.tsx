// components/HeaderMobile.tsx
'use client';

import Link from 'next/link';
import BackButton from '../BackButton/page';
import UserProfile from "@/components/UserProfile/page";

import { IoHeartSharp } from "react-icons/io5";

interface Props {
  showBack?: boolean;
  showFavorite?: boolean;
}

export default function HeaderMobile({ showBack = true, showFavorite = true }: Props) {
  return (
    <div className="fixed inset-x-0 top-0 overflow-hidden pt-2 pb-2 md:hidden z-50 blur2 rounded-b-xl shadow-sm border border-gray-200 flex flex-col">
      <div className="relative flex flex-row justify-center">
        {showBack && (
          <div className="absolute top-0 left-4">
            <BackButton className="mb-4" />
          </div>
        )}

        <div className="flex flex-row justify-center gap-2 h-min">
          <img
            src="/logo.png"
            alt="Thepaseo"
            width={48}
            height={48}
          />
        </div>

        {showFavorite && (
        <div className="absolute top-0 right-4">
          <Link
            href="/favorite"
            className="flex flex-row items-center gap-2 p-1 bg-paseo text-white rounded-full"
          >
            <IoHeartSharp size={24} />
          </Link>
        </div>
        )}
      </div>
      
    </div>
  );
}