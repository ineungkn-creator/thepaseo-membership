// components/HeaderMobile.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import BackButton from '../BackButton/page';
import { IoHeartSharp } from "react-icons/io5";

interface Props {
  showBack?: boolean;
  showFavorite?: boolean;
}

export default function HeaderMobile({ showBack = true, showFavorite = true }: Props) {
  return (
    <div className="relative overflow-hidden py-2 md:hidden">
      {showBack && (
        <div className="absolute top-4 left-4">
          <BackButton className="mb-4" />
        </div>
      )}

      <div className="flex flex-row justify-center gap-2 h-min">
        <Image src="/logo.png" alt="Thepaseo" width={50} height={50} />
      </div>

      {showFavorite && (
      <div className="absolute top-2 right-2">
        <Link
          href="/favorite"
          className="flex flex-row items-center gap-2 p-1 bg-paseo text-white rounded-full"
        >
          <IoHeartSharp size={24} />
        </Link>
      </div>
      )}
    </div>
  );
}