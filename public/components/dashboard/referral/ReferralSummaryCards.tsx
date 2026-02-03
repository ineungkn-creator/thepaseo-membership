import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Share2, UserPlus, Percent } from "lucide-react"

export default function ReferralSummaryCards({ data }: { data: any }) {
  const cards = [
    {
      title: "Referral Codes Generated",
      value: data.referralCodesGenerated.toLocaleString(),
      icon: <Share2 className="text-primary w-6 h-6" />,
    },
    {
      title: "Members from Referral",
      value: data.referredMembers.toLocaleString(),
      icon: <UserPlus className="text-green-500 w-6 h-6" />,
    },
    {
      title: "Conversion Rate",
      value: `${data.conversionRate.toFixed(2)}%`,
      icon: <Percent className="text-blue-500 w-6 h-6" />,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
