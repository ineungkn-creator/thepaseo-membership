"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import FavoriteButton from "@/components/FavoriteButton/page";
import { useSession } from "next-auth/react";
import Loading from '@/components/loading';

type Campaign = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  participantCount: number;
  joined?: boolean;
};

export default function CampaignList() {
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await fetch("/api/campaign");
        if (!res.ok) throw new Error("Failed to fetch campaign");
        const data = await res.json();
        setCampaigns(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel();

  useEffect(() => {
        }, [emblaApi])

  if (loading) {
    return (
    <Loading />
    );
  }

  if (!campaigns.length) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center">
        <p>ยังไม่มีกิจกรรมหรือของรางวัล</p>
      </div>
    );
  }

  return (
    <div className="p-0 max-w-5xl mx-auto mb-6">
      <div className="flex flex-row items-center justify-between mb-4">
        <h1 className="text-xl font-bold">แคมเปญ</h1>
        <Link href="/campaign" className="bg-gray-100 px-2 py-1 rounded-full border border-gray-20 text-xs">
          ดูทั้งหมด
        </Link>
      </div>

      <section className="embla_post">
        <div className="embla__viewport_post rounded-lg" ref={emblaRef}>
          <div className="embla__container_post">
            {campaigns.map((r) => (
              <div className="embla__slide_campaign relative w-full" key={r.id}>
                {/* ส่วนที่เป็น action bar */}
                <div className="absolute blur2 flex justify-center top-2 left-6 w-10 h-10 rounded-full border border-gray-200">
                  {session?.user?.id && (
                    <FavoriteButton
                      targetId={r.id}
                      targetType="CAMPAIGN"
                      userId={session.user.id}
                    />
                  )}
                </div>

                {/* ส่วน card */}
                <Link href={`/campaign/${r.id}`}>
                  <div className="embla__slide__number_campaign bg-gray-100 border rounded-2xl transition">
                    <div className="w-40%">
                      {r.imageUrl ? (
                      <Image
                        width={600}
                        height={600}
                        src={r.imageUrl}
                        alt={r.name}
                        className="w-full h-48 md:h-64 object-cover rounded-l-2xl"
                      />
                    ) : (
                        <Image
                          width={600}
                          height={600}
                          src='/main/no-image.png'
                          alt={r.name}
                          className="object-cover rounded-xl border bg-white p-6"
                        />
                    )}
                    </div>
                    <div className="flex flex-col flex-grow w-60% p-4 gap-4">
                        <h3 className="text-black text-base md:text-xl font-bold line-clamp-1">
                          {r.name}
                        </h3>
                        <div className="flex-grow">
                        <div
                            className="prose prose-ol:list-decimal prose-ol:pl-6 prose-ul:list-disc prose-ul:pl-6 text-xs md:text-sm text-gray-600 line-clamp-2 mb-2"
                            dangerouslySetInnerHTML={{
                            __html: r.description
                                ? r.description.length > 120
                                ? `${r.description.substring(0, 120)}...`
                                : r.description
                                : "<p>ยังไม่มีเงื่อนไข...</p>",
                            }}
                        />
                        </div>
                      </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
