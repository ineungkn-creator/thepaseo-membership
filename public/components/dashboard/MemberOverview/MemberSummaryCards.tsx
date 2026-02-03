import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Users, UserPlus, CalendarDays } from "lucide-react"

export default function MemberSummaryCards({ data }: { data: any }) {
  const cards = [
    { title: "สมาชิกทั้งหมด", value: data.totalUsers, icon: <Users className="h-6 w-6 text-primary" /> },
    { title: "สมาชิกใหม่วันนี้", value: data.newUsersToday, icon: <UserPlus className="h-6 w-6 text-green-500" /> },
    { title: "สมาชิกใหม่เดือนนี้", value: data.newUsersMonth, icon: <CalendarDays className="h-6 w-6 text-blue-500" /> },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((c, i) => (
        <Card key={i} className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
            {c.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{c.value.toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
