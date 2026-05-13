'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { CiSearch } from 'react-icons/ci';
import Papa from 'papaparse';
import { debounce } from 'lodash';
import Loading from '@/components/loading';

import { IoIosAddCircle } from "react-icons/io";

interface Shop {
  id: string;
  name: string;
  logoUrl?: string;
  imageUrl?: string;
  description?: string;
  zone?: string;
  location?: string;
  categoryId?: string;
  branchId?: string;
  category?: { 
    name: string
    color?: string
  };
  branch?: { name: string };
  tags?: { id: string; name: string }[];
}

interface Branch {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface ShopResponse {
  shops: Shop[];
  total: number;
  page: number;
  totalPages: number;
  branches: Branch[];
  categories: Category[];
}

export default function AdminShopPage() {
  const [data, setData] = useState<ShopResponse>({
    shops: [],
    total: 0,
    page: 1,
    totalPages: 1,
    branches: [],
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const branchId = searchParams.get('branchId') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const searchQuery = searchParams.get('search') || '';

  const fetchShops = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(branchId && { branchId }),
        ...(categoryId && { categoryId }),
      }).toString();

      const res = await fetch(`/api/admin/shop?${query}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to fetch shops: ${errorData.error || res.statusText}`);
      }

      const responseData: ShopResponse = await res.json();
      setData(responseData);
    } catch (err: any) {
      setError(`Failed to fetch shops: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, branchId, categoryId]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]); // ✅ no more warning

  // New function to handle shop deletion
  const handleDelete = async (shopId: string, shopName: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบร้าน "${shopName}"?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/shop?id=${shopId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete shop');
      }

      setSuccess('ร้านค้าถูกลบเรียบร้อยแล้ว');
      await fetchShops(); // Refresh the shop list
    } catch (err: any) {
      setError(`ไม่สามารถลบร้านค้าได้: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        router.push(
          `/admin/shop?page=1&search=${encodeURIComponent(value)}${
            branchId ? `&branchId=${branchId}` : ""
          }${categoryId ? `&categoryId=${categoryId}` : ""}`
        );
      }, 300),
    [branchId, categoryId, router]
  );

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/admin/shop?page=1&search=${encodeURIComponent(search)}${
        branchId ? `&branchId=${branchId}` : ''
      }${categoryId ? `&categoryId=${categoryId}` : ''}`
    );
  };

  const handleFilterChange = (type: 'branchId' | 'categoryId', value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', '1');
    if (value) {
      newParams.set(type, value);
    } else {
      newParams.delete(type);
    }
    router.push(`/admin/shop?${newParams.toString()}`);
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setError('');
    setSuccess('');
    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result: Papa.ParseResult<Record<string, string>>) => {
        try {
          for (const row of result.data as any[]) {
            const shopData = {
              name: row.name || '',
              logoUrl: row.logoUrl || '',
              imageUrl: row.imageUrl || '',
              description: row.description || '',
              zone: row.zone || '',
              location: row.location || '',
              categoryId: row.categoryId || '',
              branchId: row.branchId || '',
            };

            if (!shopData.name) {
              throw new Error('Name is required for all shops in CSV');
            }

            const res = await fetch('/api/admin/shop', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(shopData),
            });

            if (!res.ok) {
              throw new Error(`Failed to create shop: ${shopData.name}`);
            }
          }
          setSuccess('CSV imported successfully');
          fetchShops();
        } catch (err: any) {
          setError(err.message || 'Failed to import CSV');
          setLoading(false);
        }
      },
      error: () => {
        setError('Failed to parse CSV');
        setLoading(false);
      },
    });
  };

  {loading && <Loading />}

  return (
    <div className="bg-white p-4 rounded-lg flex-1 mr-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold mb-4">จัดการร้านค้า</h1>
        <Link
          href="/admin/shop/new"
          className="flex flex-row items-center gap-2 px-4 py-2 bg-paseo text-white rounded-lg"
        >
          <IoIosAddCircle size={20} />
          เพิ่มร้านค้า
        </Link>
      </div>

      {/* CSV Import Section */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">นำเข้า CSV</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleCsvUpload}
          className="file-input"
        />
        <p className="text-sm text-gray-500 mt-1">
          รูปแบบ CSV: name,logoUrl,imageUrl,description,zone,location,categoryId,branchId
        </p>
      </div>

      {/* Success/Error Messages */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      {/* Search and Filter Section */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearch} className="flex flex-row flex-1 gap-2">
          <input
            type="text"
            value={search}
            onChange={handleSearchInput}
            placeholder="ค้นหาชื่อร้าน..."
            className="input mb-2"
          />
          <button
            type="submit"
            className="flex flex-row gap-2 px-4 py-2 bg-paseo text-white rounded-lg"
          >
            <CiSearch size={24} />
            ค้นหา
          </button>
        </form>
        <select
          value={branchId}
          onChange={(e) => handleFilterChange('branchId', e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">ทุกสาขา</option>
          {data.branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
        <select
          value={categoryId}
          onChange={(e) => handleFilterChange('categoryId', e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">ทุกหมวดหมู่</option>
          {data.categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Loading Indicator for Search */}
      {loading && search && <p className="text-center text-gray-500 mt-4">กำลังค้นหา...</p>}

      {/* No Results Message */}
      {!loading && data.shops.length === 0 && (
        <p className="text-center text-gray-500 mt-4">ไม่พบร้านค้าที่ตรงกับคำค้นหา</p>
      )}

      {/* Shops Table */}
      {!loading && data.shops.length > 0 && (
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100 whitespace-nowrap">
              <th className="border px-3 py-2">โลโก้</th>
              <th className="border px-3 py-2">ชื่อร้าน</th>
              <th className="border px-3 py-2">สาขา</th>
              <th className="border px-3 py-2">หมวดหมู่</th>
              <th className="border px-3 py-2">แท็ก</th>
              <th className="border px-3 py-2">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {data.shops.map((shop) => (
              <tr key={shop.id} className="border-b hover:bg-gray-50">
                <td className="border px-3 py-2 text-center">
                  {shop.logoUrl ? (
                    <Image
                      src={shop.logoUrl}
                      alt={shop.logoUrl}
                      width={800}
                      height={600}
                      className="w-10 h-10 object-cover block mx-auto"
                    />
                  ) : (
                    '-'
                  )}
                </td>
                <td className="border px-3 py-2">{shop.name}</td>
                <td className="border px-3 py-2">{shop.branch?.name || '-'}</td>
                <td className="border px-3 py-2">
                  {shop.category ? (
                    <span
                      className="px-2 py-1 rounded text-white text-xs"
                      style={{ backgroundColor: shop.category.color || "#9dc93c" }}
                    >
                      {shop.category.name}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="border px-3 py-2">
                  {shop.tags && shop.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {shop.tags?.map((t) => (
                        <span
                          key={t.id}
                          className="px-2 py-1 text-xs bg-paseo-hover text-black rounded-full mr-1"
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                <td className="px-3 py-2 text-center flex justify-center gap-2">
                  <Link
                    href={`/admin/shop/${shop.id}/edit`}
                    className="px-2 py-1 bg-paseo text-white rounded-lg"
                  >
                    แก้ไข
                  </Link>
                  <button
                    onClick={() => handleDelete(shop.id, shop.name)}
                    className="px-2 py-1 bg-red-500 text-white rounded-lg"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-between items-center">
        <div>
          Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, data.total)} of {data.total} entries
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              router.push(
                `/admin/shop?page=${page - 1}${
                  searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''
                }${branchId ? `&branchId=${branchId}` : ''}${categoryId ? `&categoryId=${categoryId}` : ''}`
              )
            }
            disabled={page === 1}
            className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() =>
                router.push(
                  `/admin/shop?page=${pageNum}${
                    searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''
                  }${branchId ? `&branchId=${branchId}` : ''}${categoryId ? `&categoryId=${categoryId}` : ''}`
                )
              }
              className={`px-3 py-1 rounded-lg ${
                pageNum === page ? 'bg-paseo text-white' : 'bg-gray-200'
              }`}
            >
              {pageNum}
            </button>
          ))}
          <button
            onClick={() =>
              router.push(
                `/admin/shop?page=${page + 1}${
                  searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''
                }${branchId ? `&branchId=${branchId}` : ''}${categoryId ? `&categoryId=${categoryId}` : ''}`
              )
            }
            disabled={page === data.totalPages}
            className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}