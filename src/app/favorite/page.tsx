"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Loading from '@/components/loading';
import HeaderMobile from '@/components/HeaderMobile/page';
import MenuProfile from '@/components/MenuProfile/page';

import { IoHeartSharp } from "react-icons/io5";

type Favorite = {
  id: string;
  targetId: string;
  targetType:  "CAMPAIGN" | "COUPON" | "REWARD" | "EVENT"| "SHOP";
  createdAt: string;
  target: {
    id: string;
    name: string;
    imageUrl: string;
  } | null;
};

export default function FavoritePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "CAMPAIGN" | "COUPON" | "REWARD" | "EVENT"| "SHOP"
  >("CAMPAIGN");

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch("/api/favorite");
        const data = await res.json();
        if (res.ok) {
          setFavorites(data);
        }
      } catch (err) {
        console.error("Failed to load favorites:", err);
      } finally {
        setLoading(false);
      }
    };
    if (session?.user?.id) fetchFavorites();
  }, [session?.user?.id]);

  const handleUnfavorite = async (targetId: string, targetType: string) => {
    try {
      const res = await fetch("/api/favorite", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId, targetType }),
      });
      if (res.ok) {
        setFavorites((prev) =>
          prev.filter(
            (f) => !(f.targetId === targetId && f.targetType === targetType)
          )
        );
      }
    } catch (err) {
      console.error("Failed to delete favorite:", err);
    }
  };

  if (loading) return 
    <Loading />
  ;

  // group by type
  const grouped = favorites.reduce((acc: Record<string, Favorite[]>, fav) => {
    if (!acc[fav.targetType]) acc[fav.targetType] = [];
    acc[fav.targetType].push(fav);
    return acc;
  }, {});



  return (
      <div className="max-w-2xl mx-auto p-0 px-0 mb-20 md:mt-20 md:mb-0 mb-4 rounded-xl">
          <HeaderMobile />
      
            <div className="relative max-w-2xl shadow-md mx-auto p-0 px-4 pt-4 pb-4 md:mt-20 mt-44 mb-6 bg-white rounded-3xl rounded-b-xl">
  
            <MenuProfile />
  
            <div className="flex flex-col gap-4 pt-4">
              <h1 className="text-xl font-semibold flex-1 text-center">รายการโปรดของฉัน</h1>

              <div className="flex flex-row gap-2 mb-2">
                <div className="w-full overflow-x-auto mb-0 border-b scrollbar-hidden">
                  <div className="flex gap-1 whitespace-nowrap">
                    {["CAMPAIGN", "COUPON", "REWARD", "EVENT", "SHOP"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`py-2 px-4 text-sm font-semibold flex-shrink-0 flex-1 ${
                          activeTab === tab
                            ? "border-b-2 border-paseo-dark text-white bg-paseo rounded-t-lg shadow"
                            : "border-b-2 border-gray-400 text-black hover:text-gray-700 bg-gray-200 rounded-t-lg shadow"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 w-full">
                {/* Content */}
                {!grouped[activeTab]?.length ? (
                    <div className="text-center text-gray-500">
                    ยังไม่มี {activeTab.toLowerCase()} ที่บันทึกไว้
                    </div>
                ) : (
                    <div className="space-y-4">
                    {grouped[activeTab]?.map((fav) => (
                        <div
                        key={fav.id}
                        onClick={() =>
                            fav.target &&
                            router.push(`/${fav.targetType.toLowerCase()}/${fav.target.id}`)
                        }
                        className="p-2 border rounded-xl flex hover:bg-gray-50 cursor-pointer"
                        >
                        <div className="w-full flex gap-4 relative">
                            <div className="w-40% flex flex-col justify-between rounded-xl overflow-hidden shadow border border-gray-100">
                              <Image
                                src={fav.target?.imageUrl?.trim()
                                  ? fav.target.imageUrl
                                  : "/main/no-image.png"}
                                alt={fav.target?.name || "no image"}
                                width={ 600 }
                                height={ 600 }
                                className="object-cover"
                              />
                            </div>
                            <div className="w-60% flex flex-col justify-between">
                                <div className="flex flex-col">
                                    <p className="text-sm font-semibold">
                                        {fav.target?.name || "ไม่พบข้อมูล"}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        เพิ่มเมื่อ: {new Date(fav.createdAt).toLocaleString()}
                                    </p>
                                </div>

                                <button
                                    onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnfavorite(fav.targetId, fav.targetType);
                                    }}
                                    className="blur2 p-2 shadow border border-gray-200 text-red-500 rounded-full absolute bottom-0 right-1"
                                >
                                    <IoHeartSharp size={24} />
                                </button>
                                
                            </div>
                        </div>
                        
                        </div>
                    ))}
                    </div>
                )}
              </div>

            </div>
                  
          </div>
  
      </div>
    );
  }

