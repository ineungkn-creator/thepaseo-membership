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
            <h1 className="text-2xl font-bold mb-2">แคมเปญ</h1>
          </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 auto-rows-fr">
              {campaign.map(r => (
                <Link key={r.id} href={`/campaign/${r.id}`} className="border rounded-xl shadow overflow-hidden hover:shadow-lg transition">
                  <div className="relative w-full rounded-xl rounded-b-none overflow-hidden bg-white pt-100%">
                    <Image
                      src={r.imageUrl || "/main/no-image.png"}
                      alt={r.name}
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  </div>
                  <div className="flex flex-col flex-grow w-full p-4 gap-4">
                    <h3 className="text-black text-sm md:text-base font-bold line-clamp-1">
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
                </Link>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
}