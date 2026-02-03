import Link from "next/link";
import { GoHomeFill } from "react-icons/go";
import { FaShop } from "react-icons/fa6";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>

      <p className="mt-4 text-lg text-gray-600">
        หน้านี้ไม่มีอยู่ หรืออาจถูกย้ายไปแล้ว
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <Link
          href="/"
          className="flex items-center justify-start gap-2 px-10 py-3 rounded-lg blur text-white hover:bg-paseo-hover transition border border-gray-300 shadow-xs"
        >
            <GoHomeFill size={32} className="text-black bg-gray-200 rounded-full p-2 justify-center" />
            <span className="text-black text-sm">กลับหน้าแรก</span>
        </Link>

        <Link
          href="/directory"
          className="flex items-center justify-start gap-2 px-10 py-3 rounded-lg blur text-white hover:bg-paseo-hover transition border border-gray-300 shadow-xs"
        >
            <FaShop size={32} className="text-black bg-gray-200 rounded-full p-2 justify-center" />
            <span className="text-black text-sm">ดูร้านทั้งหมด</span>
        </Link>
      </div>
    </div>
  );
}
