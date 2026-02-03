'use client'

import { useEffect, useState } from "react"
import { getReferralOverview } from "@/lib/api/admin/referral"
import ReferralSummaryCards from "./ReferralSummaryCards"
import ReferralConversionChart from "./ReferralConversionChart"
import TopReferrersTable from "./TopReferrersTable"

export default function ReferralOverview() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getReferralOverview().then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading referral overview...</div>
  if (!data) return <div className="text-center py-10 text-red-500">Failed to load data</div>

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold mb-4">🤝 Referral & Member Get Member Dashboard</h1>
      <ReferralSummaryCards data={data} />
      <ReferralConversionChart data={data} />
      <TopReferrersTable data={data.topReferrers} />
    </div>
  )
}
