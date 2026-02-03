import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function TransactionTopShops({ data }: { data: any[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>🏆 Top 10 ร้านยอดใช้จ่ายสูงสุด</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-left">
              <th className="py-2">#</th>
              <th>ร้าน</th>
              <th className="text-right">ยอดใช้จ่าย (บาท)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((shop, idx) => (
              <tr key={shop.id} className="border-b last:border-none">
                <td className="py-2">{idx + 1}</td>
                <td>{shop.name}</td>
                <td className="text-right font-semibold">{shop.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
