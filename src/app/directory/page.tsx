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
import { MdStoreMallDirectory } from "react-icons/md";

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
  category?: { id: string; name: string; imageUrl: string };
  branch?: { id: string; name: string };
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
    const fetchData = async () => {
      try {
        const [branchRes, categoryRes] = await Promise.all([
          fetch('/api/shop/branch'),
          fetch('/api/shop/category'),
        ]);
        if (!branchRes.ok || !categoryRes.ok) {
          throw new Error('Failed to fetch branches or categories');
        }
        const branchesData = await branchRes.json();

        const filteredBranches = branchesData.filter(
          (branch: Branch) => branch.name !== "บางนา"
        );
        const categoriesData = await categoryRes.json();
        // Filter categories with shops
        const filteredCategories = categoriesData.filter(
          (category: Category) => (category._count?.shops ?? 0) > 0
        );
        setBranches(filteredBranches);
        setCategories(filteredCategories);
      } catch (err: any) {
        setError('Failed to load branches or categories');
      }
    };
    fetchData();
  }, []);

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
    
      <div className="relative max-w-2xl mx-auto md:pt-10 pt-20 bg-white rounded-t-5xl rounded-b-lg shadow-md flex flex-col gap-4">
        <div className="px-4 pt-0 md:px-10 md:pt-0">
          <div className="flex flex-row gap-2">
            <MdStoreMallDirectory size={24} className="text-black" />
            <h1 className="md:text-xl text-sm font-bold mb-2">ร้านค้า</h1>
          </div>
        </div>
        

        {/* Section 1: Search */}
        <div className="px-4 pt-0 md:px-10 md:pt-0 mb-2">
          <div className="relative ">
            <input
              type="text"
              placeholder="ค้นหาร้านค้า..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-paseo pl-10 pr-10"
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
        <div className="px-4 pt-0 md:px-10 md:pt-0">
          <h2 className="text-sm font-semibold mb-2">สาขา</h2>
          <div className="flex flex-wrap gap-2">
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => setFilters({ ...filters, branchId: branch.id })}
                className={`flex flex-col flex-1 py-2 px-4 rounded-xl items-center gap-1 transition hover:bg-paseo-hover ${
                  filters.branchId === branch.id
                    ? "text-black bg-paseo-hover shadow border border-2 border-paseo-dark"
                    : "text-black hover:text-gray-700 bg-gray-50 rounded-t-lg shadow"
                }`}
              >
                {branch.imageUrl && branch.imageUrl.endsWith(".svg") ? (
                  <Image
                    width={600}
                    height={600}
                    src={branch.imageUrl.startsWith('/')
                      ? branch.imageUrl
                      : branch.imageUrl.startsWith('http')
                      ? branch.imageUrl
                      : '/main/no-image.png'}
                    alt={branch.name}
                    className="w-16 h-16 mx-auto mb-1 object-contain"
                  />
                ) : (
                  <Image
                    src={
                      branch.imageUrl.startsWith('/')
                        ? branch.imageUrl
                        : branch.imageUrl.startsWith('http')
                        ? branch.imageUrl
                        : '/images/no-image.png'
                    }
                    alt={branch.name}
                    width={60}
                    height={60}
                    loading="lazy"
                    className="object-cover"
                  />
                )}
                <span className="text-xs text-center leading-tight h-[2.5rem] line-clamp-2 flex items-center justify-center">
                  {branch.name}
                </span>
            
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Categories (Embla Carousel with Drag Free) */}
        <div className="px-4 pt-0 md:px-10 md:pt-0 mb-2">
          <h2 className="text-sm font-semibold mb-2">หมวดหมู่</h2>
          {categories.length === 0 ? (
            <p className="text-gray-500">ไม่มีหมวดหมู่ที่มีร้านค้า</p>
          ) : (
            <section className="embla_category">
              <div className="embla__viewport_category rounded-lg" ref={emblaRef}>
                <div className="embla__container_category flex gap-2">
                  <div className="embla__slide_category flex-none w-24 pb-2">
                    <button
                      onClick={() => setFilters({ ...filters, categoryId: '' })}
                      className={`h-28 w-full text-center p-1 rounded-xl h-[var(--slide-height-category)] flex flex-col justify-start ${
                        filters.categoryId === ''
                          ? 'text-black bg-paseo-hover shadow border border-2 border-paseo-dark'
                          : 'text-sm text-gray-700 hover:bg-paseo-hover shadow'
                      }`}
                    >
                      <div className="w-14 h-14 mx-auto my-2 flex items-center justify-center bg-paseo rounded-full">
                        <span className="text-xs text-black">ทั้งหมด</span>
                      </div>
                      <p className="text-xs">ทั้งหมด</p>
                    </button>
                  </div>
                  {categories.map((category) => (
                    <div className="embla__slide_category flex-none w-24" key={category.id}>
                      <button
                        onClick={() => setFilters({ ...filters, categoryId: category.id })}
                        className={`h-28 w-full text-center p-1 rounded-xl h-[var(--slide-height-category)] flex flex-col justify-start border ${
                          filters.categoryId === category.id
                            ? "text-black bg-paseo-hover shadow border border-2 border-paseo-dark"
                            : "text-black hover:text-gray-700 bg-gray-50 shadow"
                        }`}
                      >
                        <div className="w-16 h-16 mx-auto mb-1">
                          {category.imageUrl && category.imageUrl.endsWith(".svg") ? (
                            <Image
                              width={600}
                              height={600}
                              src={category.imageUrl.startsWith('/')
                                ? category.imageUrl
                                : category.imageUrl.startsWith('http')
                                ? category.imageUrl
                                : '/images/no-image.png'}
                              alt={category.name}
                              className="w-16 h-16 mx-auto mb-1 object-contain"
                            />
                          ) : (
                            <Image
                              src={
                                category.imageUrl.startsWith('/')
                                  ? category.imageUrl
                                  : category.imageUrl.startsWith('http')
                                  ? category.imageUrl
                                  : '/images/no-image.png'
                              }
                              alt={category.name}
                              width={60}
                              height={60}
                              loading="lazy"
                              className="object-cover rounded-full"
                            />
                          )}
                        </div>
                        <p className="text-xs font-medium leading-tight text-center px-1 line-clamp-2 flex items-center justify-center">
                          {category.name}
                        </p>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="px-4 pt-0 md:p-10 md:pt-0 mb-2 pb-4">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 md:gap-4 gap-2">
              {shops.map((shop) => (
                <Link
                  key={shop.id}
                  href={`/shop/${shop.id}`}
                  className="overflow-hidden transition relative"
                >
                  <div className="relative flex justify-center h-28 pt-2">
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
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}

                      <div className="absolute left-2 -bottom-3 flex flex-row w-full justify-between">
                        <p className="text-xs font-semibold text-gray-600 bg-paseo-hover py-0 px-2 rounded-lg border border-paseo-dark">{shop.category?.name || '-'}</p>
                      </div>
                  </div>
                  <div className="pt-4 p-2 bg-gray-50 shadow-sm border border-gray-200 rounded-lg hover:shadow-md ">
                    <h2 className="text-sm font-semibold">{shop.name}</h2>
                    <div className="flex flex-col w-full gap-4 mt-0">
                      <div className="flex flex-row w-full justify-between">
                        <p className="text-xs text-gray-600">{shop.branch?.name || '-'}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}