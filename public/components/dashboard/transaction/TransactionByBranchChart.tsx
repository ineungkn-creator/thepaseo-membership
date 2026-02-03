'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function TransactionByBranchChart({ data }: { data: any[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>🏢 ยอดใช้จ่ายแยกตามสาขา</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical" margin={{ left: 30 }}>
            <XAxis type="number" className="text-sm" />
            <YAxis type="category" dataKey="name" className="text-sm" />
            <Tooltip />
            <Bar dataKey="total" fill="#60a5fa" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
