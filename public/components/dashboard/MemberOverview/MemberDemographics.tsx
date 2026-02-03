'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const COLORS = ['#4f46e5', '#ec4899', '#22c55e', '#f59e0b', '#3b82f6', '#8b5cf6']

export default function MemberDemographics({ data }: { data: any }) {
  const sections = [
    { title: 'เพศ', data: data.genderStats.map((g: any) => ({ name: g.gender, value: g.count })) },
    { title: 'ช่วงอายุ', data: data.ageGroups.map((a: any) => ({ name: a.range, value: a.count })) },
    { title: 'จังหวัด', data: data.provinceStats.map((p: any) => ({ name: p.province, value: p.count })) },
    { title: 'ความสนใจ', data: data.interests.map((i: any) => ({ name: i.name, value: i.count })) },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
      {sections.map((s, i) => (
        <Card key={i} className="shadow-sm">
          <CardHeader>
            <CardTitle>{s.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={s.data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {s.data.map((_: any, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
