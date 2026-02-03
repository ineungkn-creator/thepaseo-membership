import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle } from "lucide-react"

export default function SystemHealthCard({ data }: { data: any }) {
  const items = [
    { label: "API Server", value: data.api },
    { label: "Webhook", value: data.webhook },
    { label: "LINE OA Connection", value: data.line },
  ]

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>🩺 System Health Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between border rounded-md p-3">
              <span>{item.label}</span>
              {item.value ? (
                <CheckCircle className="text-green-500 w-5 h-5" />
              ) : (
                <XCircle className="text-red-500 w-5 h-5" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
