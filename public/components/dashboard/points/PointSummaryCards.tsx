import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowDownCircle, ArrowUpCircle, Coins, AlertTriangle } from "lucide-react"

export default function PointSummaryCards({ data }: { data: any }) {
  const cards = [
    {
      title: "Issued Points",
      value: data.issuedPoints.toLocaleString(),
      icon: <ArrowUpCircle className="text-green-500 w-6 h-6" />,
    },
    {
      title: "Redeem",
      value: data.redeemedPoints.toLocaleString(),
      icon: <ArrowDownCircle className="text-red-500 w-6 h-6" />,
    },
    {
      title: "Points Onhand",
      value: data.outstandingPoints.toLocaleString(),
      icon: <Coins className="text-yellow-500 w-6 h-6" />,
    },
    {
      title: "Expiring Soon (30 Days)",
      value: data.expiringPoints.toLocaleString(),
      icon: <AlertTriangle className="text-orange-500 w-6 h-6" />,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <Card key={i} className="shadow-sm">
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
            {c.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{c.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
