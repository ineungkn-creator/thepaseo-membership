'use client'

import { useEffect, useState } from "react"
import { getPointOverview } from "@/lib/api/admin/points"
import PointSummaryCards from "./PointSummaryCards"
import ExpiringPointsTable from "./ExpiringPointsTable"

export default function PointOverview() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPointOverview().then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading point overview...</div>
  if (!data) return <div className="text-center py-10 text-red-500">Failed to load data</div>

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold mb-4">🎯 Point Management Overview</h1>
      <PointSummaryCards data={data} />
      <ExpiringPointsTable data={data.expiringWallets} totalExpiring={data.expiringPoints} />
    </div>
  )
}
