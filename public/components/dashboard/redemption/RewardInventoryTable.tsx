import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function RewardInventoryTable({ data }: { data: any[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>📦 Reward Inventory (Real-Time)</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left py-2">Reward</th>
              <th className="text-right">Total Stock</th>
              <th className="text-right">Redeemed</th>
              <th className="text-right">Remaining</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.id} className="border-b last:border-none">
                <td className="py-2">{r.name}</td>
                <td className="text-right">{r.totalStock.toLocaleString()}</td>
                <td className="text-right">{r.redeemed.toLocaleString()}</td>
                <td
                  className={`text-right font-semibold ${
                    r.remaining <= 10 ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {r.remaining.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
