import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { format } from "date-fns"

export default function ErrorReportTable({ data }: { data: any[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>⚠️ Error Reports — Receipt Upload Failures</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left py-2">Receipt ID</th>
              <th className="text-left">User</th>
              <th className="text-left">Reason</th>
              <th className="text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-muted-foreground">
                  No error reports found
                </td>
              </tr>
            )}
            {data.map((r) => (
              <tr key={r.id} className="border-b last:border-none">
                <td className="py-2">{r.id}</td>
                <td>{r.user?.name || "ไม่พบชื่อผู้ใช้"}</td>
                <td>{r.rejectReason || "-"}</td>
                <td className="text-right">{format(new Date(r.createdAt), "dd/MM/yyyy HH:mm")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
