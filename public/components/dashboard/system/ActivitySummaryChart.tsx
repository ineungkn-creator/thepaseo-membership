'use client'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export default function ActivitySummaryChart({ data }: { data: any[] }) {
  const chartData = data.map((item) => ({
    action: item.action,
    count: item._count.action,
  }))

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>📊 Staff Activity Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="action" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
