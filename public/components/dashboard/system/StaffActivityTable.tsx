import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { format } from "date-fns"

export default function StaffActivityTable({ data }: { data: any[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>🧑‍💼 Recent Staff Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left py-2">Staff</th>
              <th className="text-left">Role</th>
              <th className="text-left">Action</th>
              <th className="text-left">Description</th>
              <th className="text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-muted-foreground">
                  No recent activities found
                </td>
              </tr>
            )}
            {data.map((log) => (
              <tr key={log.id} className="border-b last:border-none">
                <td className="py-2">{log.admin?.name || "System"}</td>
                <td>{log.admin?.role || "-"}</td>
                <td>{log.action}</td>
                <td>{log.description || "-"}</td>
                <td className="text-right">{format(new Date(log.createdAt), "dd/MM/yyyy HH:mm")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
