'use client'

import { useEffect, useState } from 'react'
import { getMemberOverview } from '@/lib/api/admin/member'
import MemberSummaryCards from './MemberSummaryCards'
import MemberGrowthChart from './MemberGrowthChart'
import MemberDemographics from './MemberDemographics'
import MemberBranchChart from './MemberBranchChart'
import MemberToolbar from './MemberToolbar'

export default function MemberOverview() {
  const [data, setData] = useState<any>(null)
  const [filteredData, setFilteredData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMemberOverview().then(res => {
      setData(res)
      setFilteredData(res)
    }).finally(() => setLoading(false))
  }, [])

  const handleFilter = (month: Date | null) => {
    if (!month) {
      setFilteredData(data)
      return
    }
    const target = month.toISOString().slice(0, 7)
    const filtered = {
      ...data,
      memberGrowth: data.memberGrowth.filter((x: any) => x.month === target),
    }
    setFilteredData(filtered)
  }

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading member overview...</div>
  if (!filteredData) return <div className="text-center py-10 text-red-500">Failed to load data</div>

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-4">👥 Member Overview</h1>
        <MemberToolbar data={filteredData} onFilter={handleFilter} />
        <MemberSummaryCards data={filteredData} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <MemberGrowthChart data={filteredData.memberGrowth} />
        </div>
        <div>
          <MemberBranchChart data={filteredData.memberByBranch} />
        </div>
      </div>

      <MemberDemographics data={filteredData.demographics} />
    </div>
  )
}
