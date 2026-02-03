"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import FavoriteButton from "@/components/FavoriteButton/page";
import { useSession } from "next-auth/react";
import Loading from "@/components/loading";
import Image from "next/image";
import { TbBorderAll } from "react-icons/tb"; // Import FaBorderAll icon

type Campaign = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  participantCount: number;
  joined?: boolean;
};

type Branch = {
  id: string | null;
  name: string;
  logo?: string; // Make logo optional since "All" uses SVG
};

export default function PrivilegeCampaignList() {
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Static branch data
  const branches: Branch[] = [
    { id: null, name: "ทั้งหมด" }, // No logo for "All" (uses SVG)
    { id: "701a697c-8b3d-41e2-876d-61b75c6ca1d5", name: "กาญจนาภิเษก", logo: "/Logo_Park.png" },
    { id: "c3842823-8e5b-4868-abc9-1ead064941be", name: "ลาดกระบัง", logo: "/Logo_mall.png" },
    { id: "c7522197-846f-412a-88db-4905bde069ea", name: "รามคำแหง", logo: "/Logo_Town.png" },
  ];

  useEffect(() => {
    // Fetch campaigns based on selected branch
    const fetchCampaigns = async () => {
      try {
        const url = selectedBranch
          ? `/api/campaign?branchId=${selectedBranch}`
          : "/api/campaign";
        const res = await fetch(url);
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
  }, [selectedBranch]);

  const [emblaRef, emblaApi] = useEmblaCarousel();

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-0 max-w-5xl mx-auto mb-6">
      <div className="flex flex-row justify-between mb-4">
        <h1 className="text-xl font-bold">แคมเปญ</h1>
        <Link href="/campaign" className="text-base">
          ดูทั้งหมด
        </Link>
      </div>

      {/* Branch Tabs */}
      <div className="flex flex-wrap gap-4 mb-4">
        {branches.map((branch) => (
          <button
            key={branch.id || "all"}
            onClick={() => setSelectedBranch(branch.id)}
            className={`flex flex-col py-2 px-4 w-20% rounded-xl flex items-center gap-1 transition ${
              selectedBranch === branch.id
                ? "bg-paseo text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {branch.id === null ? (
              <TbBorderAll size={32} className="mr-2 text-xl" /> // Use SVG for "All"
            ) : (
              branch.logo && (
                <Image
                  src={branch.logo}
                  alt={branch.name}
                  width={32}
                  height={32}
                  className="mr-2"
                />
              )
            )}
            <span className="text-sm">{branch.name}</span>
          </button>
        ))}
      </div>

      {campaigns.length === 0 ? (
        <div className="p-6 text-center">
          <p>ยังไม่มีกิจกรรมหรือของรางวัล</p>
        </div>
      ) : (
        <section className="embla_post">
          <div className="embla__viewport_post rounded-lg" ref={emblaRef}>
            <div className="embla__container_post">
              {campaigns.map((r) => (
                <div className="embla__slide_campaign relative w-full" key={r.id}>
                  <div className="absolute blur2 flex justify-center top-2 left-6 w-10 h-10 rounded-full shadow-sm border border-gray-200">
                    {session?.user?.id && (
                      <FavoriteButton
                        targetId={r.id}
                        targetType="CAMPAIGN"
                        userId={session.user.id}
                      />
                    )}
                  </div>
                  <Link href={`/campaign/${r.id}`}>
                    <div className="embla__slide__number_campaign bg-gray-100 border rounded-2xl hover:shadow-lg transition shadow">
                      <div className="w-50%">
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
                            className="w-full h-48 md:h-64 object-cover rounded-l-2xl border bg-white p-6"
                          />
                      )}
                      </div>
                      <div className="w-50% p-4">
                        <h3 className="text-black text-xl font-bold line-clamp-1">
                          {r.name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}