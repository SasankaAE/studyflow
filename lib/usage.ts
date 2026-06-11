import { createClient } from "@/lib/supabase/server"
import { PLANS } from "@/lib/plans"

export async function checkUsage(type: "chat" | "paper") {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { allowed: false, reason: "Unauthorized" }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single()

  const plan = (profile?.plan ?? "free") as "free" | "pro"
  const limits = PLANS[plan]

  // count this month's usage
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from("activity_log")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("type", type)
    .gte("created_at", startOfMonth.toISOString())

  const limit = type === "chat" ? limits.chatsPerMonth : limits.downloadsPerMonth
  const used = count ?? 0

  if (used >= limit) {
    return {
      allowed: false,
      reason: `You've reached your ${plan} plan limit of ${limit} ${type}s/month. Upgrade to Pro.`,
      used,
      limit,
    }
  }

  return { allowed: true, used, limit }
}