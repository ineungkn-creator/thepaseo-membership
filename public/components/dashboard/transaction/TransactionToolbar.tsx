'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, FileDown } from "lucide-react"
import * as XLSX from "xlsx"

export default function TransactionToolbar({
  data,
  onFilter,
}: {
  data: any
  onFilter: (filters: any) => void
}) {
  const [month, setMonth] = useState<Date | null>(null)
  const [branchId, setBranchId] = useState<string>("")
  const [branches, setBranches] = useState<any[]>([])

  // ✅ โหลดรายการสาขาจาก API จริง
  useEffect(() => {
    const fetchBranches = async () => {
      const res = await fetch("/api/admin/branches")
      const json = await res.json()
      setBranches(json)
    }
    fetchBranches()
  }, [])

  // ✅ ฟังก์ชันส่ง filter กลับไปหา dashboard
    const handleFilterChange = (key: string, value: any) => {
    let newMonth = month
    let newBranchId = branchId

    if (key === "month") newMonth = value
    if (key === "branchId") newBranchId = value

    setMonth(newMonth)
    setBranchId(newBranchId)

    // ✅ สร้าง filters object
    const filters: any = {}

    if (newMonth) {
        filters.month = newMonth.getMonth() + 1
        filters.year = newMonth.getFullYear()
    }

    // ✅ ใส่ branchId เฉพาะถ้ามีค่า
    if (newBranchId) filters.branchId = newBranchId

    // ✅ ส่งไปยัง parent dashboard
    onFilter(filters)
    }

  // ✅ Export Excel
  const handleExport = () => {
    if (!data) return
    const wb = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([
        {
          TotalSpending: data.totalSpending,
          Growth: data.growth,
          AvgSpending: data.averageSpending,
        },
      ]),
      "Summary"
    )
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(data.spendingByCategory),
      "ByCategory"
    )
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(data.spendingByBranch),
      "ByBranch"
    )
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(data.topShops),
      "TopShops"
    )

    XLSX.writeFile(
      wb,
      `transaction_report_${format(new Date(), "yyyy-MM-dd")}.xlsx`
    )
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-6">
      {/* 🔍 Filter Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* เลือกเดือน */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              {month ? format(month, "MMMM yyyy") : "เลือกเดือน"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0">
            <Calendar
              mode="single"
              selected={month || undefined}
              onSelect={(m) => handleFilterChange("month", m)}
              captionLayout="dropdown"
              fromYear={2023}
              toYear={new Date().getFullYear()}
            />
          </PopoverContent>
        </Popover>

        {/* เลือกสาขา */}
        <select
        value={branchId}
        onChange={(e) => handleFilterChange("branchId", e.target.value)}
        className="px-3 py-2 border rounded-lg bg-white"
        >
        <option value="">ทุกสาขา</option>
        {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
            {branch.name}
            </option>
        ))}
        </select>
      </div>

      {/* 📤 Export */}
      <Button
        onClick={handleExport}
        className="flex items-center gap-2 mt-3 md:mt-0"
      >
        <FileDown className="w-4 h-4" />
        Export Excel
      </Button>
    </div>
  )
}
