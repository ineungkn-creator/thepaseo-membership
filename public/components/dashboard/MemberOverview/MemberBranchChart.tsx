'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function MemberBranchChart({ data }: { data: any[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>🏢 สมาชิกตามสาขา (Top 5)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical" margin={{ left: 30 }}>
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" />
            <Tooltip />
            <Bar dataKey="count" fill="#60a5fa" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
