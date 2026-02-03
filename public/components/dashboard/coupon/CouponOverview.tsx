'use client'

import { useEffect, useState } from "react"
import { getCouponOverview } from "@/lib/api/admin/coupon"
import CouponSummaryCards from "./CouponSummaryCards"
import CouponUsageChart from "./CouponUsageChart"
import CampaignUsageTable from "./CampaignUsageTable"
import CampaignROITable from "./CampaignROITable"

export default function CouponOverview() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCouponOverview().then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading coupon dashboard...</div>
  if (!data) return <div className="text-center py-10 text-red-500">Failed to load data</div>

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold mb-4">🎟 Coupon & Campaign Dashboard</h1>

      <CouponSummaryCards data={data} />
      <CouponUsageChart data={data.campaignUsage} />
      <CampaignUsageTable data={data.campaignUsage} />
      <CampaignROITable data={data.roiData} />
    </div>
  )
}
