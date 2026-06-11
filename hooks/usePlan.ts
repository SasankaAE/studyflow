"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PLANS, type Plan } from "@/lib/plans"

export function usePlan() {
  const supabase = createClient()
  const [plan, setPlan] = useState<Plan>("free")
  const [usage, setUsage] = useState({ chats: 0, papers: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles").select("plan").eq("id", user.id).single()

      const startOfMonth = new Date()
      startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0)

      const [{ count: chats }, { count: papers }] = await Promise.all([
        supabase.from("activity_log").select("*", { count: "exact", head: true })
          .eq("user_id", user.id).eq("type", "chat")
          .gte("created_at", startOfMonth.toISOString()),
        supabase.from("activity_log").select("*", { count: "exact", head: true })
          .eq("user_id", user.id).eq("type", "paper")
          .gte("created_at", startOfMonth.toISOString()),
      ])

      setPlan((profile?.plan ?? "free") as Plan)
      setUsage({ chats: chats ?? 0, papers: papers ?? 0 })
      setLoading(false)
    }
    load()
  }, [])

  const limits = PLANS[plan]

  return { plan, usage, limits, loading }
}