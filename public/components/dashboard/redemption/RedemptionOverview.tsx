'use client'

import { useEffect, useState } from "react"
import { getRedemptionOverview } from "@/lib/api/admin/redemption"
import RedemptionSummaryCards from "./RedemptionSummaryCards"
import RedemptionTrendChart from "./RedemptionTrendChart"
import RewardInventoryTable from "./RewardInventoryTable"

export default function RedemptionOverview() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRedemptionOverview().then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading redemption overview...</div>
  if (!data) return <div className="text-center py-10 text-red-500">Failed to load data</div>

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold mb-4">🎁 Redemption & Rewards Dashboard</h1>
      <RedemptionSummaryCards data={data} />
      <RedemptionTrendChart data={data.redeemTrend} />
      <RewardInventoryTable data={data.rewardInventory} />
    </div>
  )
}
