"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { LuShare2 } from "react-icons/lu";
import { FaFacebook, FaLine } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { GoShare } from "react-icons/go";
import { IoIosClose } from "react-icons/io";

interface ShareButtonProps {
  title: string;
  linkShare?: string; // รับ linkShare จากโมเดล (optional)
}

export default function ShareButton({ title, linkShare }: ShareButtonProps) {
  const pathname = usePathname();
  const origin =
    process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
  // ใช้ linkShare ถ้ามีค่า ไม่เช่นนั้น fallback ไปที่ origin + pathname
  const shareUrl = linkShare || `${origin}${pathname}`;
  const [buttonText, setButtonText] = useState("Copy"); // จัดการข้อความปุ่ม

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: "มาร่วมกิจกรรมนี้กัน!",
          url: shareUrl,
        });
      } catch (err: any) {
        if (err.name === "AbortError") {
          //console.log("User canceled sharing");
        } else {
          //console.error("Share failed:", err);
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setButtonText("Copied!");
      setTimeout(() => setButtonText("Copy"), 1000);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setButtonText("Copied!");
    setTimeout(() => setButtonText("Copy"), 1000);
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">
          <LuShare2 className="text-2xl" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="blur overflow-hidden fixed bottom-1 left-1 right-1 text-black rounded-xl shadow-sm border border-gray-200">
        <div className="max-w-2xl mx-auto w-full pt-4 px-4 pb-6">
          <DrawerHeader>
            <div className="flex flex-row justify-between items-center">
              <DrawerTitle>Share</DrawerTitle>
              <DrawerClose asChild>
                <Button className="p-0" variant="outline">
                  <IoIosClose size={40} />
                </Button>
              </DrawerClose>
            </div>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>

          <div className="p-0 pb-0">
            {/* แสดงลิงก์และปุ่ม Copy */}
            <div className="bg-gray-100 flex flex-row justify-between items-center border py-2 px-2 rounded-lg">
              <span className="truncate max-w-[200px]">{shareUrl}</span>
              <button
                onClick={handleCopy}
                className="p-2 bg-gray-600 text-white rounded-xl hover:opacity-80"
              >
                {buttonText}
              </button>
            </div>

            <div className="flex gap-4 mt-4 justify-start">
              {/* Facebook */}
              <Link
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                className="flex flex-col justify-center items-center"
              >
                <div className="bg-blue-600 rounded-full relative flex h-12 w-12 items-center justify-center rounded-[320px]">
                  <FaFacebook className="p-1 text-white hover:opacity-80" size={40} />
                </div>
                <span className="whitespace-nowrap text-center text-xs">Facebook</span>
              </Link>

              {/* X */}
              <Link
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  shareUrl
                )}&text=${encodeURIComponent(title)}`}
                target="_blank"
                className="flex flex-col justify-center items-center"
              >
                <div className="bg-black rounded-full relative flex h-12 w-12 items-center justify-center rounded-[320px]">
                  <FaXTwitter className="p-1 text-white hover:opacity-80" size={40} />
                </div>
                <span className="whitespace-nowrap text-center text-xs">X</span>
              </Link>

              {/* LINE */}
              <Link
                href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                className="flex flex-col justify-center items-center"
              >
                <div className="bg-paseo rounded-full relative flex h-12 w-12 items-center justify-center rounded-[320px]">
                  <FaLine className="p-1 text-white hover:opacity-80" size={40} />
                </div>
                <span className="whitespace-nowrap text-center text-xs">LINE</span>
              </Link>

              {/* More */}
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleShare();
                }}
                className="flex flex-col justify-center items-center"
              >
                <div className="bg-gray-500 rounded-full relative flex h-12 w-12 items-center justify-center rounded-[320px]">
                  <GoShare className="p-1 text-white hover:opacity-80" size={40} />
                </div>
                <span className="whitespace-nowrap text-center text-xs">More</span>
              </Link>
            </div>
          </div>

          <DrawerFooter className="hidden">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}