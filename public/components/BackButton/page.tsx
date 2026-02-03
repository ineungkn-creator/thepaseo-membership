'use client';

import { useRouter } from 'next/navigation';
import { MdArrowBackIos } from "react-icons/md";

interface BackButtonProps {
  label?: string; // ข้อความกำกับปุ่ม
  className?: string; // class เสริม เช่น margin
}

export default function BackButton({ label = "กลับ", className }: BackButtonProps) {
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
      className=""
    >
      <MdArrowBackIos size={32} className="text-paseo" />
    </button>
  );
}

