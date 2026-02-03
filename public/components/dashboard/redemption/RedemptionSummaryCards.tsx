import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { CalendarDays, BarChart3 } from "lucide-react"

export default function RedemptionSummaryCards({ data }: { data: any }) {
  const cards = [
    {
      title: "Redeems Today",
      value: data.dailyRedeem.toLocaleString(),
      icon: <CalendarDays className="text-primary w-6 h-6" />,
    },
    {
      title: "Redeems This Month",
      value: data.monthlyRedeem.toLocaleString(),
      icon: <BarChart3 className="text-blue-500 w-6 h-6" />,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {cards.map((c, i) => (
        <Card key={i} className="shadow-sm">
          <CardHeader className="flex justify-between items-center pb-2">
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
