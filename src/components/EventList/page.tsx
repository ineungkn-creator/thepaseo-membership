"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import FavoriteButton from "@/components/FavoriteButton/page";
import { useSession } from "next-auth/react";
import { BsClipboardCheck } from "react-icons/bs";

type Event = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  registrations: number;
  joined?: boolean;
};


export default function EventList({ shopId }: { shopId?: string }) { // ✅ เพิ่ม prop
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const url = shopId ? `/api/event?shopId=${shopId}` : `/api/event`; // ✅ ใช้ shopId ถ้ามี
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        setEvents(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [shopId]); // ✅ refetch เมื่อ shopId เปลี่ยน

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center">
        <p>กำลังโหลด...</p>
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center">
        <p>ยังไม่มีกิจกรรมหรือของรางวัล</p>
      </div>
    );
  }

  return (
    <div className="w-full p-0 max-w-5xl mx-auto mb-0">
      <div className="flex flex-row items-end justify-between mb-3">
        <span className="text-base font-bold">กิจกรรม</span>
        {!shopId && ( // ✅ ซ่อนปุ่ม “ดูทั้งหมด” เมื่ออยู่ในร้าน
          <Link href="/event" className="bg-gray-100 px-2 py-1 rounded-full border border-gray-20 text-xs">
            ดูทั้งหมด
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 auto-rows-fr">
        {events.map((r) => {
          const startDate = new Date(r.startDate);
          const endDate = new Date(r.endDate);
          const now = new Date();

          let status = "";
          if (now < startDate) status = "กำลังจะจัด";
          else if (now >= startDate && now <= endDate) status = "กำลังจัด";
          else status = "สิ้นสุดแล้ว";

          const monthNames = [
            "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
            "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
          ];

          return (
            <div className=" relative w-full flex flex-col" key={r.id}>
              <div className="absolute blur2 flex justify-center top-2 left-2 w-10 h-10 rounded-full shadow-sm border border-gray-200">
                {session?.user?.id && (
                  <FavoriteButton
                    targetId={r.id}
                    targetType="EVENT"
                    userId={session.user.id}
                  />
                )}
              </div>

              <Link
                href={`/event/${r.id}`}
                >
                <div className="embla__slide__number_campaign bg-gray-100 border rounded-2xl transition flex items-stretch">
                  <div className="w-40%">
                    <Image
                      src={r.imageUrl || "/main/no-image.png"}
                      alt={r.name}
                      width={300}
                      height={300}
                      className="w-full h-full rounded-l-xl"
                      unoptimized
                    />
                  </div>

                <div className="flex flex-col w-60% p-4 gap-2 justify-between">

                  <div className="pt-1 flex flex-col flex-grow gap-2">
                    <h3 className="text-xs font-semibold line-clamp-3 leading-4 text-start">
                      {r.name.length > 40 ? r.name.substring(0, 40) + "..." : r.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-2">
                      {startDate.getDate()} - {endDate.getDate()} {monthNames[endDate.getMonth()]} {endDate.getFullYear()}
                    </p>
                  </div>

                  <div className="px-4 md:px-8">

                  <button
                    className={`py-2 w-full rounded-full text-sm md:text-base font-bold flex flex-row align-center justify-center items-center gap-2 hover:bg-paseo-hover hover:text-black ${
                      status === "สิ้นสุดแล้ว"
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-paseo text-white"
                    }`}
                    disabled={status === "สิ้นสุดแล้ว"}
                  >
                    <BsClipboardCheck size={20} />
                    <span className="text-xs">
                      {status === "สิ้นสุดแล้ว" ? "สิ้นสุดแล้ว" : "เข้าร่วมกิจกรรม"}
                    </span>
                  </button>

                  </div>

                </div>

              </div>

                
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
