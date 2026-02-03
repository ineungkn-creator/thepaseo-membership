'use client'

import { useState, useEffect } from "react"
import { getTransactionOverview } from "@/lib/api/admin/transaction"
import TransactionToolbar from "./TransactionToolbar"
import TransactionSummaryCards from "./TransactionSummaryCards"
import TransactionByCategoryChart from "./TransactionByCategoryChart"
import TransactionByBranchChart from "./TransactionByBranchChart"
import TransactionTopShops from "./TransactionTopShops"

export default function TransactionOverview() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async (filters?: any) => {
    let query = ""
    if (filters) {
      const params = new URLSearchParams(filters).toString()
      query = `?${params}`
    }
    const res = await fetch(`/api/admin/dashboard/transaction${query}`, { cache: "no-store" })
    const json = await res.json()
    setData(json)
    setLoading(false)
  }
  

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading transactions...</div>
  if (!data) return <div className="text-center py-10 text-red-500">Failed to load data</div>

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold mb-2">💰 Transaction Overview</h1>
      <TransactionToolbar data={data} onFilter={fetchData} />
      <TransactionSummaryCards data={data} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TransactionByCategoryChart data={data.spendingByCategory} />
        <TransactionByBranchChart data={data.spendingByBranch} />
      </div>

      <TransactionTopShops data={data.topShops} />
    </div>
  )
}
