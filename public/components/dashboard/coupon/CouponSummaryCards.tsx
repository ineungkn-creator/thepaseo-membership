import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Activity, CheckCircle, XCircle, Gift } from "lucide-react"

export default function CouponSummaryCards({ data }: { data: any }) {
  const cards = [
    { title: "Active Campaigns", value: data.activeCampaigns, icon: <Activity className="text-green-500 w-6 h-6" /> },
    { title: "Ended Campaigns", value: data.endedCampaigns, icon: <XCircle className="text-gray-500 w-6 h-6" /> },
    { title: "Coupons Distributed", value: data.totalCoupons, icon: <Gift className="text-primary w-6 h-6" /> },
    { title: "Coupons Used", value: data.usedCoupons, icon: <CheckCircle className="text-blue-500 w-6 h-6" /> },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <Card key={i} className="shadow-sm">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
            {c.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{c.value.toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
