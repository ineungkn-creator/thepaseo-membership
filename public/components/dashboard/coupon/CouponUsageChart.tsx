'use client'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

export default function CouponUsageChart({ data }: { data: any[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>📊 Coupon Usage Rate per Campaign</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="usageRate" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
