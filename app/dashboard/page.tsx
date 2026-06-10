"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { MessageSquare, FileDown, Clock, TrendingUp } from "lucide-react"

export default function OverviewPage() {
  const supabase = createClient()

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
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoISO = weekAgo.toISOString()

    const [{ data: allLogs }, { data: recentLogs }] = await Promise.all([
      supabase.from("activity_log").select("type").eq("user_id", user.id),
      supabase
        .from("activity_log")
        .select("type")
        .eq("user_id", user.id)
        .gte("created_at", weekAgoISO),
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

    // realtime subscription
    const channel = supabase
      .channel("activity_log_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_log" },
        () => loadData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const statCards = [
    {
      label: "Total Chats",
      value: stats.totalChats,
      delta: `+${stats.chatsThisWeek} this week`,
      icon: MessageSquare,
    },
    {
      label: "Papers Downloaded",
      value: stats.papersDownloaded,
      delta: `+${stats.papersThisWeek} this week`,
      icon: FileDown,
    },
    {
      label: "Avg. Response",
      value: "1.4s",
      delta: "-0.2s improved",
      icon: Clock,
    },
    {
      label: "Usage",
      value: `${Math.min(Math.round(((stats.totalChats + stats.papersDownloaded) / 200) * 100), 100)}%`,
      delta: "of monthly plan",
      icon: TrendingUp,
    },
  ]

  function timeAgo(iso: string) {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
    return "Yesterday"
  }

  // paste your existing JSX below, swap static values with live ones:
  return (
    <div className="space-y-6 p-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(({ label, value, delta, icon: Icon }) => (
          <div
            key={label}
            className="space-y-2 rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{label}</p>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold">{loading ? "—" : value}</p>
            <p className="text-xs text-muted-foreground">{delta}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="rounded-lg border border-border bg-card">
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
                  {item.type === "chat" ? (
                    <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <FileDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
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
  )
}
