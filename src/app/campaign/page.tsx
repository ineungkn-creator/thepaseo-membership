"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Loading from '@/components/loading';
import UserProfile from '@/components/UserProfile/page';
import HeaderMobile from '@/components/HeaderMobile/page';

type Campaign = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  participantCount: number;
};

export default function CampaignPage() {
  const [campaign, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const res = await fetch("/api/campaign");
      const data = await res.json();
      setCampaigns(data);
      setLoading(false);
    };
    fetchCampaigns();
  }, []);

  if (loading) return 
    <Loading />
  ;

  return (
    <div className="max-w-2xl mx-auto p-0 px-0 mb-20 md:mt-20 mt-0 md:mb-0 mb-4 rounded-xl">
      <HeaderMobile />

      <div className="md:hidden p-0 pt-8 md:mt-20 -mb-16 rounded-xl">
        <div className="w-full pt-4 pb-0 px-4 md:pt-0 md:px-20 md:pb-0">
          <UserProfile showOn="both" />
        </div>
      </div>

      <div className="w-full bg-white p-4 pt-16 md:p-10 md:mt-28 mt-6 md:pt-10 rounded-xl">
        <h1 className="text-xl font-semibold mb-4">แคมเปญ</h1>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 auto-rows-fr">
          {campaign.map(r => (
            <Link key={r.id} href={`/campaign/${r.id}`}>
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
                    <h3 className="text-black text-sm md:text-base font-bold line-clamp-1">
                      {r.name}
                    </h3>
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
          ))}
        </div>
      </div>
    </div>
  );
}