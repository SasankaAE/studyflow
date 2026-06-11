"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { usePlan } from "@/hooks/usePlan"
import { MessageSquare, FileDown, Clock, TrendingUp, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function OverviewPage() {
  const supabase = createClient()
  const router = useRouter()
  const { plan, usage, limits, loading: planLoading } = usePlan()

  const [stats, setStats] = useState({
    totalChats: 0,
    chatsThisWeek: 0,
    papersDownloaded: 0,
    papersThisWeek: 0,
  })
  const [activity, setActivity] = useState<
    { id: string; title: string; type: string; created_at: string }[]
  >([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoISO = weekAgo.toISOString()

    const [{ data: allLogs }, { data: recentLogs }] = await Promise.all([
      supabase.from("activity_log").select("type").eq("user_id", user.id),
      supabase.from("activity_log").select("type").eq("user_id", user.id).gte("created_at", weekAgoISO),
    ])

    const { data: activityRows } = await supabase
      .from("activity_log")
      .select("id, title, type, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    setStats({
      totalChats: allLogs?.filter((r) => r.type === "chat").length ?? 0,
      chatsThisWeek: recentLogs?.filter((r) => r.type === "chat").length ?? 0,
      papersDownloaded: allLogs?.filter((r) => r.type === "paper").length ?? 0,
      papersThisWeek: recentLogs?.filter((r) => r.type === "paper").length ?? 0,
    })
    setActivity(activityRows ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    const channel = supabase
      .channel("activity_log_changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_log" }, () => loadData())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  function timeAgo(iso: string) {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
    return "Yesterday"
  }

  const chatPct = limits.chatsPerMonth === Infinity ? 100
    : Math.min(Math.round((usage.chats / limits.chatsPerMonth) * 100), 100)
  const paperPct = limits.downloadsPerMonth === Infinity ? 100
    : Math.min(Math.round((usage.papers / limits.downloadsPerMonth) * 100), 100)

  const statCards = [
    {
      label: "Total Chats",
      value: stats.totalChats,
      delta: `+${stats.chatsThisWeek} this week`,
      icon: MessageSquare,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Papers Downloaded",
      value: stats.papersDownloaded,
      delta: `+${stats.papersThisWeek} this week`,
      icon: FileDown,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Avg. Response",
      value: "1.4s",
      delta: "-0.2s improved",
      icon: Clock,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      label: "Usage",
      value: `${chatPct}%`,
      delta: "of monthly chats",
      icon: TrendingUp,
      color: chatPct >= 90 ? "text-destructive" : "text-orange-500",
      bg: chatPct >= 90 ? "bg-destructive/10" : "bg-orange-500/10",
    },
  ]

  return (
    <div className="space-y-6 p-6">

      {/* Plan banner — free users only */}
      {!planLoading && plan === "free" && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <Zap className="h-4 w-4 text-orange-500 shrink-0" />
            <div>
              <p className="text-sm font-medium">You're on the Free plan</p>
              <p className="text-xs text-muted-foreground">
                {usage.chats} / {limits.chatsPerMonth} chats · {usage.papers} / {limits.downloadsPerMonth} downloads used this month
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => router.push("/dashboard/settings")}>
            Upgrade to Pro
          </Button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(({ label, value, delta, icon: Icon, color, bg }) => (
          <div key={label} className="space-y-3 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{label}</p>
              <div className={`rounded-md p-1.5 ${bg}`}>
                <Icon className={`h-3.5 w-3.5 ${color}`} />
              </div>
            </div>
            <p className="text-2xl font-semibold">{loading ? "—" : value}</p>
            <p className="text-xs text-muted-foreground">{delta}</p>
          </div>
        ))}
      </div>

      {/* Plan usage + Activity side by side on large screens */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Plan & usage */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Plan & usage</p>
            <Badge variant={plan === "pro" ? "default" : "secondary"} className="text-xs capitalize">
              {planLoading ? "…" : plan}
            </Badge>
          </div>

          <div className="space-y-3">
            {/* Chats */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Chats</span>
                <span>
                  {usage.chats} / {limits.chatsPerMonth === Infinity ? "∞" : limits.chatsPerMonth}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    chatPct >= 90 ? "bg-destructive" : "bg-emerald-500"
                  }`}
                  style={{ width: limits.chatsPerMonth === Infinity ? "100%" : `${chatPct}%` }}
                />
              </div>
            </div>

            {/* Downloads */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Downloads</span>
                <span>
                  {usage.papers} / {limits.downloadsPerMonth === Infinity ? "∞" : limits.downloadsPerMonth}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    paperPct >= 90 ? "bg-destructive" : "bg-emerald-500"
                  }`}
                  style={{ width: limits.downloadsPerMonth === Infinity ? "100%" : `${paperPct}%` }}
                />
              </div>
            </div>
          </div>

          {plan === "free" && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => router.push("/dashboard/settings")}
            >
              Upgrade to Pro
            </Button>
          )}

          {plan === "pro" && (
            <p className="text-xs text-muted-foreground text-center">Unlimited access active</p>
          )}
        </div>

        {/* Recent activity */}
        <div className="rounded-lg border border-border bg-card lg:col-span-2">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-medium">Recent activity</p>
          </div>
          {loading ? (
            <p className="p-4 text-sm text-muted-foreground">Loading…</p>
          ) : activity.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul>
              {activity.map((item, i) => (
                <li
                  key={item.id}
                  className={`flex items-center justify-between px-4 py-3 text-sm ${
                    i !== activity.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-md p-1.5 shrink-0 ${
                      item.type === "chat" ? "bg-blue-500/10" : "bg-emerald-500/10"
                    }`}>
                      {item.type === "chat"
                        ? <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                        : <FileDown className="h-3.5 w-3.5 text-emerald-500" />}
                    </div>
                    <span className="max-w-xs truncate">{item.title}</span>
                  </div>
                  <span className="ml-4 shrink-0 text-xs text-muted-foreground">
                    {timeAgo(item.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}