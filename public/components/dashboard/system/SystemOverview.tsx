'use client'

import { useEffect, useState } from "react"
import { getSystemDashboard } from "@/lib/api/admin/system"
import StaffActivityTable from "./StaffActivityTable"
import SystemHealthCard from "./SystemHealthCard"
import ErrorReportTable from "./ErrorReportTable"
import ActivitySummaryChart from "./ActivitySummaryChart"

export default function SystemOverview() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSystemDashboard().then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading system dashboard...</div>
  if (!data) return <div className="text-center py-10 text-red-500">Failed to load data</div>

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold mb-4">🧠 System & Staff Activity Dashboard</h1>
      <SystemHealthCard data={data.health} />
      <ActivitySummaryChart data={data.summary} />
      <StaffActivityTable data={data.recentLogs} />
      <ErrorReportTable data={data.errorReports} />
    </div>
  )
}
