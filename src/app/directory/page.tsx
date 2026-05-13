'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import Link from 'next/link';
import { debounce } from 'lodash';
import useEmblaCarousel from 'embla-carousel-react';
import Loading from '@/components/loading';
import HeaderMobile from '@/components/HeaderMobile/page';
import { CiSearch, CiCircleRemove } from 'react-icons/ci';
import { HiMiniSquares2X2 } from "react-icons/hi2";

interface Shop {
  id: string;
  name: string;
  logoUrl?: string;
  imageUrl: string;
  description?: string;
  zone?: string;
  location?: string;
  categoryId?: string;
  branchId?: string;

  category?: {
    id: string;
    name: string;
    imageUrl?: string;
    color?: string;
  };

  branch?: {
    id: string;
    name: string;
  };
}

interface Branch {
  id: string;
  name: string;
  imageUrl: string;
}

interface Category {
  id: string;
  name: string;
  imageUrl: string;
  color?: string;
  _count: { shops: number };
}

export default function DirectoryPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [filters, setFilters] = useState({
    branchId: '',
    categoryId: '',
    search: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();
  const [emblaRef, emblaApi] = useEmblaCarousel({ dragFree: true });
  const [filterLoading, setFilterLoading] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else if (res.status === 401) {
          router.push('/auth/login');
        }
      } catch (err) {
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  // Fetch branches and categories
  useEffect(() => {
    const fetchBranches = async () => {
      const res = await fetch('/api/shop/branch');
      const data = await res.json();

      const filteredBranches = data.filter(
        (branch: Branch) => branch.name !== "บางนา"
      );

      setBranches(filteredBranches);
    };

    fetchBranches();
  }, []);

  useEffect(() => {
    if (!filters.branchId) return;

    const fetchCategories = async () => {
      try {
        const res = await fetch(`/api/shop/category?branchId=${filters.branchId}`);
        const data = await res.json();

        const filteredCategories = data.filter(
          (category: Category) => (category._count?.shops ?? 0) > 0
        );

        setCategories(filteredCategories);
      } catch (err) {
        setError('Failed to load categories');
      }
    };

    fetchCategories();
  }, [filters.branchId]);

  // Set default branchId to the first branch if available
  useEffect(() => {
    if (branches.length > 0 && !filters.branchId) {
      setFilters((prev) => ({ ...prev, branchId: branches[0].id }));
    }
  }, [branches]);

  // Debounced fetch shops
const fetchShops = async (currentFilters = filters) => {
  let loadingTimer: any;

  try {
    loadingTimer = setTimeout(() => {
      setFilterLoading(true);
    }, 150);

    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(currentFilters).filter(([_, v]) => v)
      )
    );

    const res = await fetch(`/api/shop?${params.toString()}`);
    const data = await res.json();

    setShops(Array.isArray(data) ? data : []);
  } finally {
    clearTimeout(loadingTimer);
    setFilterLoading(false);
  }
};



const debouncedFetchShops = useMemo(() => {
  return debounce((nextFilters) => {
    fetchShops(nextFilters);
  }, 300);
}, []);


useEffect(() => {
  debouncedFetchShops(filters);
  return () => {
    debouncedFetchShops.cancel();
  };
}, [filters]);

  // Log Embla API slides
  useEffect(() => {
  }, [emblaApi]);

  // New function to clear search
  const handleClearSearch = () => {
    setFilters({ ...filters, search: '' });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-2xl mx-auto p-0 px-0 mb-20 md:mt-20 md:mb-0 mb-4 rounded-xl">
      <HeaderMobile />
    
      <div className="md:pt-2 pt-16">
        <div className="relative max-w-2xl mx-auto md:pt-10 pt-8 md:mt-8 mt-0 bg-white rounded-t-xl rounded-b-lg shadow-md flex flex-col gap-4">
          <div className="px-4 pt-0 md:px-10 md:pt-0">
            <div className="flex flex-row gap-2 px-4">
              <span className="text-base font-bold">ร้านค้า</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 px-4">
            {/* Section 1: Search */}
            <div className="px-4 pt-0 md:px-10 md:pt-0 mb-2">
              <div className="relative ">
                <input
                  type="text"
                  placeholder="ค้นหาร้านค้า..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="bg-gray-50 p-2 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-paseo pl-10 pr-10"
                />
                <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                {filters.search && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="ล้างการค้นหา"
                  >
                    <CiCircleRemove size={24} />
                  </button>
                )}
              </div>

            </div>
            

            {/* Section 2: Branches */}
            <div className="flex flex-col px-4 pt-0 md:px-10 md:pt-0 gap-3">
              <span className="text-base font-bold">สาขา</span>

              <div className="flex justify-center md:gap-10 gap-4 overflow-x-auto pb-2">
                {branches.map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() =>
                      setFilters({
                        ...filters,
                        branchId: branch.id,
                        categoryId: "",
                      })
                    }
                    className="flex flex-col items-center gap-2 transition min-w-[90px]"
                  >
                    {/* LOGO */}
                    <div
                      className={`w-20 h-20 p-2 aspect-square rounded-xl overflow-hidden flex items-center justify-center border transition
                      ${
                        filters.branchId === branch.id
                          ? "bg-gray-50 border-paseo-dark"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <Image
                        src={
                          branch.imageUrl?.startsWith("/")
                            ? branch.imageUrl
                            : branch.imageUrl?.startsWith("http")
                            ? branch.imageUrl
                            : "/images/no-image.png"
                        }
                        alt={branch.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-contain"
                        unoptimized
                      />
                    </div>

                    {/* NAME */}
                    <span className="text-xs font-semibold text-center leading-tight">
                      {branch.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Categories */}
            <div className="flex flex-col px-4 pt-0 md:px-10 md:pt-0 gap-3">
              <span className="text-base font-bold">หมวดหมู่</span>

              {categories.length === 0 ? (
                <p className="text-gray-500">ไม่มีหมวดหมู่ที่มีร้านค้า</p>
              ) : (
                <div className="overflow-x-auto">
                  <div className="grid grid-rows-2 grid-flow-col auto-cols-[90px] md:gap-6 gap-2 pb-2">

                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() =>
                          setFilters({ ...filters, categoryId: category.id })
                        }
                        className="flex flex-col items-center gap-2 transition w-[90px]"
                      >

                        <div
                          className={`w-18 h-18 p-2 rounded-xl overflow-hidden flex items-center justify-center border ${
                            filters.categoryId === category.id
                              ? "bg-gray-50 border-paseo-dark"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <Image
                            src={category.imageUrl || "/images/no-image.png"}
                            alt={category.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-contain"
                            unoptimized
                          />
                        </div>

                        <span className="text-xs font-medium text-center leading-tight line-clamp-1 break-words w-20 min-h-[2.5rem]">
                          {category.name}
                        </span>

                      </button>
                    ))}

                    {/* ALL */}
                    <button
                      onClick={() => setFilters({ ...filters, categoryId: "" })}
                      className="flex flex-col items-center gap-2 transition min-w-[90px]"
                    >
                      <div
                        className={`w-18 h-18 p-2 rounded-xl flex items-center justify-center border transition ${
                          filters.categoryId === ""
                            ? "bg-gray-50 border-paseo-dark"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <Image
                          src="/icon/icon-all.png"
                          alt="all"
                          width={40}
                          height={40}
                          className="w-full h-full object-contain"
                          unoptimized
                        />
                      </div>

                      <span className="text-xs font-medium text-center leading-tight line-clamp-2 text-warp">
                        ทั้งหมด
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-6 md:p-10 md:pt-8 bg-gray-100 rounded-xl">
            {/* Error Message */}
            {error && <p className="text-red-500 mb-4">{error}</p>}

            {/* Loading Indicator for Search */}
            {filterLoading && (
              <p className="text-gray-500 text-center mb-4">กำลังค้นหา...</p>
            )}

            {/* Shop Grid */}
            {shops.length === 0 ? (
              <p className="text-gray-500">ไม่พบร้านค้า</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 md:gap-4 gap-6">
                {shops.map((shop) => (
                  <Link
                    key={shop.id}
                    href={`/shop/${shop.id}`}
                    className="overflow-hidden transition relative bg-white p-2 rounded-xl shadow-sm"
                  >
                    <div className="relative flex justify-center h-24">
                      {shop.logoUrl ? (
                        <Image
                          src={
                            shop.logoUrl.startsWith('/')
                              ? shop.logoUrl
                              : shop.logoUrl.startsWith('http')
                              ? shop.logoUrl
                              : '/images/no-image.png'
                          }
                          alt={shop.name}
                          width={60}
                          height={60}
                          className="object-contain w-5rem h-5rem rounded-lg"
                          unoptimized
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}

                    </div>
                    <div className="flex flex-col gap-0 items-start">
                      <p
                        className="text-xs font-semibold text-white px-2 py-0 rounded-lg"
                        style={{
                          backgroundColor: shop.category?.color || "#9dc93c"
                        }}
                      >
                        {shop.category?.name || "-"}
                      </p>
                      <h2 className="text-sm font-semibold mt-2 mb-0">{shop.name}</h2>
                      <p className="text-xs text-gray-600">{shop.branch?.name || '-'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}