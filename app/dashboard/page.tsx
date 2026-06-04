import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, MessageSquare, FileDown, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const stats = [
  {
    label: "Total Chats",
    value: "128",
    delta: "+12 this week",
    icon: MessageSquare,
    trend: "up",
  },
  {
    label: "Papers Downloaded",
    value: "47",
    delta: "+5 this week",
    icon: FileDown,
    trend: "up",
  },
  {
    label: "Avg. Response",
    value: "1.4s",
    delta: "-0.2s improved",
    icon: Clock,
    trend: "up",
  },
  {
    label: "Usage",
    value: "68%",
    delta: "of monthly plan",
    icon: TrendingUp,
    trend: "mid",
  },
]

const recentActivity = [
  { title: "Chat: Explain quantum computing", time: "2 min ago", type: "chat" },
  {
    title: "Downloaded: ML Research 2024.pdf",
    time: "1 hr ago",
    type: "paper",
  },
  { title: "Chat: Summarize this document", time: "3 hr ago", type: "chat" },
  { title: "Downloaded: NLP Advances.pdf", time: "Yesterday", type: "paper" },
  { title: "Chat: Write a Python script", time: "Yesterday", type: "chat" },
]

export default function OverviewPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, delta, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-xs font-medium">
                {label}
              </CardDescription>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest actions across the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-b border-border/50 py-2 last:border-0"
              >
                <div
                  className={`h-2 w-2 shrink-0 rounded-full ${item.type === "chat" ? "bg-primary" : "bg-emerald-500"}`}
                />
                <p className="flex-1 truncate text-sm">{item.title}</p>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {item.time}
                </span>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {item.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Plan Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Plan Usage</CardTitle>
            <CardDescription>Free plan · resets in 12 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              { label: "AI Messages", used: 128, total: 200, pct: 64 },
              { label: "Downloads", used: 47, total: 50, pct: 94 },
              { label: "Storage", used: 1.2, total: 5, pct: 24, unit: "GB" },
            ].map(({ label, used, total, pct, unit }) => (
              <div key={label} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground">
                    {used}
                    {unit ?? ""} / {total}
                    {unit ?? ""}
                  </span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>
            ))}
            <Button className="w-full" size="lg">
              <Link href="/">Upgrade to Pro</Link>
            </Button>
            {/* <Badge className="mt-2 w-full justify-center">Upgrade to Pro</Badge> */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
