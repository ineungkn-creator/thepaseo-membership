import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Coins, TrendingUp, TrendingDown } from "lucide-react"

export default function TransactionSummaryCards({ data }: { data: any }) {
  const growthIcon = data.growth >= 0 ? (
    <TrendingUp className="w-5 h-5 text-green-500" />
  ) : (
    <TrendingDown className="w-5 h-5 text-red-500" />
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="shadow-sm flex flex-col justify-between">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>ยอดใช้จ่ายรวม (บาท)</CardTitle>
          <Coins className="text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{data.totalSpending.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card className="shadow-sm flex flex-col justify-between">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>เฉลี่ยต่อสมาชิก (บาท)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{data.averageSpending.toFixed(2)}</div>
        </CardContent>
      </Card>

      <Card className="shadow-sm flex flex-col justify-between">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>% การเติบโตเดือนนี้</CardTitle>
          {growthIcon}
        </CardHeader>
        <CardContent>
          <div
            className={`text-3xl font-bold ${
              data.growth >= 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {data.growth.toFixed(2)}%
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
