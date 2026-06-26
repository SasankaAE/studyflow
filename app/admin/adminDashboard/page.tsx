"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import {
  LayoutDashboard, CreditCard, FileUp,
  Users, TrendingUp, Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Overview page ────────────────────────────────────────────────────────────

export default function AdminOverviewPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    proUsers: 0,
    pendingTransfers: 0,
    loading: true,
  })

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/stats")
      const data = await res.json()
      setStats({ ...data, loading: false })
    }
    load()
  }, [])

  const cards = [
    {
      label: "Total users",
      value: stats.totalUsers,
      icon: <Users className="h-4 w-4" />,
      badgeClass: "bg-blue-500/10 text-blue-400",
    },
    {
      label: "Pro subscribers",
      value: stats.proUsers,
      icon: <TrendingUp className="h-4 w-4" />,
      badgeClass: "bg-emerald-500/10 text-emerald-400",
    },
    {
      label: "Pending transfers",
      value: stats.pendingTransfers,
      icon: <Clock className="h-4 w-4" />,
      badgeClass: "bg-amber-500/10 text-amber-400",
    },
  ]

  const quickActions = [
    {
      href: "/admin/dashboard/bank-transfers",
      icon: <CreditCard className="h-4 w-4" />,
      title: "Review transfers",
      desc: "Approve or reject payment requests",
    },
    {
      href: "/admin/dashboard/upload",
      icon: <FileUp className="h-4 w-4" />,
      title: "Upload paper",
      desc: "Add a new PDF to the library",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">StudyFlow admin overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {c.label}
                </p>
                <span className={cn("rounded-lg p-1.5", c.badgeClass)}>{c.icon}</span>
              </div>
              <p
                className={cn(
                  "mt-3 text-3xl font-semibold",
                  stats.loading ? "text-muted animate-pulse" : "text-foreground"
                )}
              >
                {stats.loading ? "—" : c.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Quick actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {quickActions.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary/50 hover:bg-accent"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {item.icon}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}