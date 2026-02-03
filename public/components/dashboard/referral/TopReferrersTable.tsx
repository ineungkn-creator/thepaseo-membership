import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function TopReferrersTable({ data }: { data: any[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>🏆 Top Referrers (ชวนเพื่อนมากที่สุด)</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="py-2 text-left">#</th>
              <th className="text-left">Name</th>
              <th className="text-left">Phone</th>
              <th className="text-right">Referrals</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-muted-foreground">
                  ไม่มีข้อมูลผู้แนะนำ
                </td>
              </tr>
            )}
            {data.map((r, idx) => (
              <tr key={r.id} className="border-b last:border-none">
                <td className="py-2">{idx + 1}</td>
                <td>{r.name}</td>
                <td>{r.phone || "-"}</td>
                <td className="text-right font-semibold">{r.referrals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
