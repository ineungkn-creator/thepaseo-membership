"use client";

import { useState, useEffect } from "react"; 
import Loading from '@/components/loading';

import { MdDiscount } from "react-icons/md";
import { FaClock } from "react-icons/fa";
import { RiBitCoinFill } from "react-icons/ri";

import { FaReceipt } from "react-icons/fa";

type PointTransaction = {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description?: string;
  createdAt: string;
  receipt: {
    amount: number;
    status: string;
    rejectReason: string;
    shopName: string;
    branchName: string;
  },
  coupon: {
    code: string;
    name: string;
    expiresAt: string;
    shops?: string;
    branches?: string;
  };
};

type UserCoupon = {
  id: string;
  used: boolean;
  assignedAt: string;
  coupon: {
    id: string;
    code: string;
    name: string;
    expiresAt: string;
    shops?: { name: string }[];
    branches?: { name: string }[];
  };
};

export default function HistoryScorePage() {
  const [balance, setBalance] = useState(0);
  const [points, setPoints] = useState<PointTransaction[]>([]);
  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const PAGE_SIZE = 20;

  const [activeMainTab, setActiveMainTab] = useState<"Score" | "Coupon">("Score");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/history?page=${page}&limit=20`
        );
        if (!res.ok) throw new Error("Failed to fetch history");

        const data = await res.json();
        setBalance(data.balance || 0);
        setPoints(data.points || []);
        setCoupons(data.coupons || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [page]);

  const thaiMonths = [
    { value: "01", label: "มกราคม" },
    { value: "02", label: "กุมภาพันธ์" },
    { value: "03", label: "มีนาคม" },
    { value: "04", label: "เมษายน" },
    { value: "05", label: "พฤษภาคม" },
    { value: "06", label: "มิถุนายน" },
    { value: "07", label: "กรกฎาคม" },
    { value: "08", label: "สิงหาคม" },
    { value: "09", label: "กันยายน" },
    { value: "10", label: "ตุลาคม" },
    { value: "11", label: "พฤศจิกายน" },
    { value: "12", label: "ธันวาคม" },
  ];

  const getYears = () => {
    const years = new Set<string>();
    points.forEach((p) => years.add(getMonthYear(p.createdAt).year));
    coupons.forEach((c) => years.add(getMonthYear(c.assignedAt).year));
    return Array.from(years).sort((a, b) => Number(b) - Number(a)); // เรียงจากมากไปน้อย
  };

  if (loading) {
    return (
      <Loading />
    );
  }

  // ฟังก์ชันช่วย
  const getMonthYear = (dateString: string) => {
    const date = new Date(dateString);
    return {
      month: String(date.getMonth() + 1).padStart(2, "0"),
      year: String(date.getFullYear()),
    };
  };

  const filteredPoints = points.filter((p) => {
    const { month, year } = getMonthYear(p.createdAt);
    const matchesMonth = selectedMonth ? month === selectedMonth : true;
    const matchesYear = selectedYear ? year === selectedYear : true;
    return matchesMonth && matchesYear;
  });

  const filteredCoupons = coupons.filter((c) => {
    const { month, year } = getMonthYear(c.assignedAt);
    const matchesMonth = selectedMonth ? month === selectedMonth : true;
    const matchesYear = selectedYear ? year === selectedYear : true;
    return matchesMonth && matchesYear;
  });

return (
      <>
          <h1 className="text-base font-semibold text-center mb-2">ประวัติการได้รับพอยท์</h1>

          {/* Tabs */}
          <div className="flex flex-row justify-between mb-4 bg-gray-100 rounded-xl p-2">
            <button
              className={`flex-1 py-2 px-2 rounded-xl text-sm font-bold ${activeMainTab === "Score" ? "bg-paseo text-white" : "text-gray-600"}`}
              onClick={() => setActiveMainTab("Score")}
            >
              พอยท์
            </button>
            <button
              className={`flex-1 py-2 px-2 rounded-xl text-sm font-bold ${activeMainTab === "Coupon" ? "bg-paseo text-white" : "text-gray-600"}`}
              onClick={() => setActiveMainTab("Coupon")}
            >
              คูปอง
            </button>
          </div>

        {/* Filters */}
        <div className="flex flex-row gap-2 mb-4">
          <select
            className="flex-1 p-2 rounded-xl border text-sm"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="">ทุกเดือน</option>
            {thaiMonths.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <select
            className="flex-1 p-2 rounded-xl border text-sm"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">ทุกปี</option>
            {getYears().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Tab พอยท์ */}
        {activeMainTab === "Score" && (
          <div>
            {filteredPoints.length === 0 ? (
              <p className="text-sm text-gray-500 text-center">ยังไม่มีประวัติพอยท์</p>
            ) : (
              <div className="space-y-4 w-full">
                {filteredPoints.map((p) => (
                  <div key={p.id} className="flex flex-row items-center gap-2 p-4 rounded-xl shadow-sm bg-white border">
                    <div className="w-10%">
                      <FaReceipt size={24} className="text-paseo" />
                    </div>

                    <div className="flex flex-col w-90% gap-2">
                      <div className="w-full flex flex-row justify-between">

                        <div className="flex flex-row gap-2 w-80%">
                          <FaClock size={16} className="text-paseo" />
                          <p className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleString()}</p>
                        </div>

                        <div className="flex flex-row justify-start gap-2 w-20%">
                          <RiBitCoinFill size={24} className="text-paseo" style={{ color: '#FFD32C' }}/>
                          <span className={`font-bold text-sm ${p.amount > 0 ? "text-paseo" : "text-red-500"}`}>
                            {p.amount > 0 ? `+${p.amount}` : p.amount}
                          </span>
                        </div>

                      </div>

                        <div className="flex-1">
                          <h3 className="text-sm font-bold line-clamp-2">{p.description || "รายการแต้ม"}</h3>
                        </div>

                      {p.type === "RECEIPT" && p.receipt && (
                        <div className="flex flex-col gap-1">
                          <div className="w-full flex flex-row justify-between">
                            <span className="text-sm text-medium text-black">ร้านค้า: {p.receipt.shopName}</span>
                            <span className="text-sm text-medium text-black">สาขา: {p.receipt.branchName}</span>
                          </div>

                          

                          <span className="text-sm text-gray-500">
                          สถานะ:{" "}
                          <span
                            className={
                              p.receipt.status === "APPROVED"
                                ? "text-sm text-medium text-paseo"
                                : p.receipt.status === "REJECTED"
                                ? "text-red-600"
                                : "text-gray-600"
                            }
                          >
                            {p.receipt.status === "APPROVED"
                              ? "อนุมัติแล้ว"
                              : p.receipt.status === "REJECTED"
                              ? `ถูกปฏิเสธ (${p.receipt.rejectReason || "ไม่มีเหตุผล"})`
                              : "รอตรวจสอบ ⏳"}
                          </span>
                          {p.receipt.status === "REJECTED" && (
                            <span className="text-red-600"> ({p.receipt.rejectReason})</span>
                          )}
                          </span>
                        </div>
                      )}

                    </div>
                    
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab คูปอง */}
        {activeMainTab === "Coupon" && (
          <div>
            {filteredCoupons.length === 0 ? (
              <p className="text-gray-500 text-center">ยังไม่มีคูปอง</p>
            ) : (
              <div className="space-y-4 ">
                {filteredCoupons.map((uc) => (
                  <div key={uc.id} className="flex items-center gap-4 p-4 rounded-xl shadow-sm bg-white border relative">
                    <div className="flex-shrink-0 p-2 bg-red-500 rounded-full">
                      <MdDiscount size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold">{uc.coupon.name}</h3>
                      <p className="text-xs text-gray-500">หมดอายุ {new Date(uc.coupon.expiresAt).toLocaleDateString()}</p>
                      
                      <div className="w-full flex flex-col">
                        <span className="text-xs text-gray-500">
                          ร้านค้า:{" "}
                          <span className="text-xs text-medium text-black">
                          {uc.coupon.shops && uc.coupon.shops.length > 0
                          ? uc.coupon.shops.map((s) => s.name).join(", ")
                          : "-"}
                          </span>
                        </span>
                        <span className="text-xs text-gray-500">
                          สาขา:{" "}
                          <span className="text-xs text-medium text-black">
                          {uc.coupon.branches && uc.coupon.branches.length > 0
                            ? uc.coupon.branches.map((b) => b.name).join(", ")
                            : "-"}
                          </span>
                        </span>
                      </div>

                      <span className={`absolute bottom-10 right-4 items-right bg-gray-100 py-1 px-2 rounded-lg text-xs font-bold ${uc.used ? "text-gray-400" : "bg-paseo text-white"}`}>
                        {uc.used ? "ใช้แล้ว" : "ยังไม่ใช้"}
                      </span>
                      
                      
                    </div>
                    
                  </div>
                ))}
              </div>
            )}
          </div>
        )}  
      </>
    );
  }
