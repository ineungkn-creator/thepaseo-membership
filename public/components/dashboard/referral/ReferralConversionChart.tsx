'use client'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

const COLORS = ["#4f46e5", "#22c55e"]

export default function ReferralConversionChart({ data }: { data: any }) {
  const chartData = [
    { name: "Converted (from referral)", value: data.referredMembers },
    { name: "Other signups", value: data.referralCodesGenerated - data.referredMembers },
  ]

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>📈 Referral Conversion Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
