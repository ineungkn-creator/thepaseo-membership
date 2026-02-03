import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function CampaignUsageTable({ data }: { data: any[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>🎯 Campaign Usage Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left py-2">Campaign</th>
              <th className="text-right">Distributed</th>
              <th className="text-right">Used</th>
              <th className="text-right">Usage Rate (%)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b last:border-none">
                <td className="py-2">{row.name}</td>
                <td className="text-right">{row.distributed.toLocaleString()}</td>
                <td className="text-right">{row.used.toLocaleString()}</td>
                <td className={`text-right font-semibold ${row.usageRate >= 50 ? "text-green-600" : "text-yellow-600"}`}>
                  {row.usageRate.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
