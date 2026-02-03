'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function TransactionByCategoryChart({ data }: { data: any[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>🏷 ยอดใช้จ่ายแยกตามหมวดหมู่ร้านค้า</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" className="text-sm" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Bar dataKey="total" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
