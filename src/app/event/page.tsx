"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import Loading from '@/components/loading';
import FavoriteButton from "@/components/FavoriteButton/page";
import UserProfile from '@/components/UserProfile/page';
import HeaderMobile from '@/components/HeaderMobile/page';

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

export default function EventList() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/event");
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
  }, []);

  if (loading) {
    return (
      <Loading />
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
    <div>
      <HeaderMobile />
    
      <div className="max-w-2xl mx-auto p-0 -mb-14 md:mt-0 md:mb-16 rounded-xl">
        <div className="w-full md:pt-2 pt-16 px-10 md:px-20 md:pb-0">
          <UserProfile showOn="mobile" />
        </div>
      </div>

      <div className="relative max-w-2xl shadow-md mx-auto p-0 md:pt-0 pt-20 pb-4 mb-6 bg-white rounded-5xl rounded-b-xl">

        <div className="px-4 md:p-10 max-w-5xl mx-auto mb-6">
          <div className="flex flex-row justify-between mb-2">
            <h1 className="text-2xl font-bold mb-2">อีเว้นท์</h1>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 auto-rows-fr">
            {events.map((r, index) => {
              const startDate = new Date(r.startDate);
              const endDate = new Date(r.endDate);
              const now = new Date();

              // ตรวจสอบสถานะของกิจกรรม
              let status = "";
              if (now < startDate) {
                status = "กำลังจะจัด";
              } else if (now >= startDate && now <= endDate) {
                status = "กำลังจัด";
              } else if (now > endDate) {
                status = "สิ้นสุดแล้ว";
              }

              const dateOptions: Intl.DateTimeFormatOptions = {
                year: "numeric",
                month: "long",
                day: "numeric",
              };
              const timeOptions: Intl.DateTimeFormatOptions = {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              };

              const start_day = startDate.getDate();
              const start_month_index = startDate.getMonth();
              const start_year = startDate.getFullYear();

              const end_day = endDate.getDate();
              const end_month_index = endDate.getMonth();
              const end_year = endDate.getFullYear();

              const monthNames = [
                "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
                "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
              ];

              const start_month_text = monthNames[start_month_index];
              const end_month_text = monthNames[end_month_index];

              const monthOptions: Intl.DateTimeFormatOptions = { month: "long" };

              const start_month_long = startDate.toLocaleDateString("th-TH", monthOptions);
              const end_month_long = endDate.toLocaleDateString("th-TH", monthOptions);

              const startDate_time = startDate.toLocaleTimeString("th-TH", timeOptions);
              const endDate_time = endDate.toLocaleTimeString("th-TH", timeOptions);

              return (
                <div className="embla__slide_campaign relative w-full flex flex-col" key={r.id}>
                  {/* Action bar */}
                  <div className="absolute blur2 flex justify-center top-8 left-8 w-10 h-10 rounded-full shadow-sm border border-gray-200">
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
                    className={`w-full flex flex-col gap-4 p-4 border border-gray-200 rounded-xl shadow overflow-hidden transition bg-white h-full`}
                  >
                  <div className="relative w-full rounded-xl overflow-hidden bg-white pt-125%">
                    <Image
                      src={r.imageUrl || "/main/no-image.png"}
                      alt={r.name}
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  </div>

                    <div className="pt-1 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold line-clamp-1">{r.name}</h3>
                      <p className="text-sm text-gray-500">{status}</p>
                      <div className="flex-grow">
                        <div
                          className="prose prose-ol:list-decimal prose-ol:pl-6 prose-ul:list-disc prose-ul:pl-6 text-base text-gray-600 line-clamp-2 mb-2"
                          dangerouslySetInnerHTML={{
                            __html: r.description
                              ? r.description.length > 120
                                ? `${r.description.substring(0, 120)}...`
                                : r.description
                              : "<p>ยังไม่มีเงื่อนไข...</p>",
                          }}
                        />
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {start_day} - {end_day} {end_month_long} {end_year}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        เวลา {startDate_time} - {endDate_time} น.
                      </p>
                      <p className="text-xs text-gray-600">
                        ผู้เข้าร่วม: {r.registrations} คน
                      </p>
                    </div>

                    <button
                      className={`p-2 rounded-xl text-base font-bold ${
                        status === "สิ้นสุดแล้ว"
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-paseo text-white"
                      }`}
                      disabled={status === "สิ้นสุดแล้ว"}
                    >
                      {status === "สิ้นสุดแล้ว" ? "สิ้นสุดแล้ว" : "เข้าร่วมกิจกรรม"}
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}