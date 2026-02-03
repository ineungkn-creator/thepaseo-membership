'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, FileDown } from "lucide-react"
import * as XLSX from "xlsx"

export default function MemberToolbar({ data, onFilter }: { data: any, onFilter: (month: Date | null) => void }) {
  const [date, setDate] = useState<Date | null>(null)

  const handleExport = () => {
    if (!data) return

    const workbook = XLSX.utils.book_new()

    // Sheet 1: Summary
    const summarySheet = XLSX.utils.json_to_sheet([
      { Metric: "สมาชิกทั้งหมด", Value: data.totalUsers },
      { Metric: "สมาชิกใหม่วันนี้", Value: data.newUsersToday },
      { Metric: "สมาชิกใหม่เดือนนี้", Value: data.newUsersMonth },
    ])
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary")

    // Sheet 2: Member Growth
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.memberGrowth), "Member Growth")

    // Sheet 3: Branch
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.memberByBranch), "Branch")

    // Sheet 4: Demographics
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(data.demographics.genderStats),
      "Gender"
    )
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(data.demographics.ageGroups),
      "Age Groups"
    )
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(data.demographics.provinceStats),
      "Province"
    )
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(data.demographics.interests),
      "Interests"
    )

    XLSX.writeFile(workbook, `member_report_${format(new Date(), "yyyy-MM-dd")}.xlsx`)
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
      {/* Left: Filter */}
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              {date ? format(date, "MMMM yyyy") : "เลือกเดือน"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 bg-white">
            <Calendar
              mode="single"
              selected={date || undefined}
              onSelect={(d) => {
                const selectedDate = d ?? null;   // แก้ undefined → null
                setDate(selectedDate);
                onFilter(selectedDate);
              }}
              captionLayout="dropdown"
              fromYear={2023}
              toYear={new Date().getFullYear()}
            />
          </PopoverContent>
        </Popover>
        {date && (
          <Button variant="ghost" size="sm" onClick={() => { setDate(null); onFilter(null) }}>
            ล้างตัวกรอง
          </Button>
        )}
      </div>

      {/* Right: Export */}
      <Button onClick={handleExport} className="flex items-center gap-2">
        <FileDown className="w-4 h-4" />
        Export Excel
      </Button>
    </div>
  )
}
