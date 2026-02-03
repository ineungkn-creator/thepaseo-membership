import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { format } from "date-fns"

export default function ExpiringPointsTable({
  data,
  totalExpiring,
}: {
  data: any[]
  totalExpiring: number
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>⚠️ Expiring Points (ภายใน 30 วัน)</CardTitle>
        <p className="text-sm text-muted-foreground">
          รวม {totalExpiring.toLocaleString()} พอยท์ จาก {data.length} ผู้ใช้
        </p>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="py-2 text-left">ชื่อ</th>
              <th className="text-left">เบอร์โทร</th>
              <th className="text-right">พอยท์ที่เหลือ</th>
              <th className="text-right">วันหมดอายุ</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-muted-foreground">
                  ไม่มีพอยท์ที่ใกล้หมดอายุ
                </td>
              </tr>
            )}
            {data.map((item) => (
              <tr key={item.id} className="border-b last:border-none">
                <td className="py-2">{item.userName}</td>
                <td>{item.phone}</td>
                <td className="text-right font-semibold">{item.remainingPoints.toLocaleString()}</td>
                <td className="text-right">
                  {item.expiresAt ? format(new Date(item.expiresAt), "dd/MM/yyyy") : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
