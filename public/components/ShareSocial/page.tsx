"use client";
import { usePathname } from "next/navigation";
import { FaFacebook, FaLine, FaTwitter, FaLink } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

export default function SocialShare({ title }: { title: string }) {
  const pathname = usePathname();
  const origin =
    process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const shareUrl = `${origin}${pathname}`;

  return (
    <div className="flex gap-3 mt-4">
      {/* Facebook */}
      <Link
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}`}
        target="_blank"
        className="p-2 bg-blue-600 text-white rounded-full hover:opacity-80"
      >
        <FaFacebook size={20} />
      </Link>

      {/* Twitter */}
      <Link
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
          shareUrl
        )}&text=${encodeURIComponent(title)}`}
        target="_blank"
        className="p-2 bg-sky-500 text-white rounded-full hover:opacity-80"
      >
        <FaTwitter size={20} />
      </Link>

      {/* LINE */}
      <Link
        href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
          shareUrl
        )}`}
        target="_blank"
        className="p-2 bg-paseo text-white rounded-full hover:opacity-80"
      >
        <FaLine size={20} />
      </Link>

      {/* Copy Link */}
      <button
        onClick={() => {
          navigator.clipboard.writeText(shareUrl);
          alert("ลิงก์ถูกคัดลอกแล้ว!");
        }}
        className="p-2 bg-gray-600 text-white rounded-full hover:opacity-80"
      >
        <FaLink size={20} />
      </button>
    </div>
  );
}
