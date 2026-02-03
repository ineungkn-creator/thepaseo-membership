import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function CampaignROITable({ data }: { data: any[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>💰 Campaign ROI — Sales from Coupons</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left py-2">Campaign</th>
              <th className="text-right">Sales from Coupon (฿)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.id} className="border-b last:border-none">
                <td className="py-2">{r.name}</td>
                <td className="text-right font-semibold">{r.totalSales.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
