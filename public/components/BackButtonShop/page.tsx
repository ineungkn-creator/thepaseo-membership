'use client';

import { useRouter } from 'next/navigation';
import { MdArrowBackIos } from "react-icons/md";

interface BackButtonShopProps {
  label?: string; // ข้อความกำกับปุ่ม
  className?: string; // class เสริม เช่น margin
}

export default function BackButtonShop({ label = "กลับ", className }: BackButtonShopProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
    if (window.history.length > 1) {
        router.back();
    } else {
        router.push('/');
    }
    }}
      className={`text-sm font-medium text-white ${className}`}
    >
      <MdArrowBackIos size={32} className="text-white" />
    </button>
  );
}
