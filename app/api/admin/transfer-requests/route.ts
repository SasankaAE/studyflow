import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("bank_transfer_requests")
    .select("*")
    .order("submitted_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const userIds = [...new Set((data ?? []).map((r: any) => r.user_id))]

  const { data: profilesData } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds)

  // Enrich with auth.users email as fallback
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
  const authEmailMap = Object.fromEntries(users.map(u => [u.id, u.email]))

  const profileMap = Object.fromEntries(
    (profilesData ?? []).map((p: any) => [p.id, {
      ...p,
      email: p.email || authEmailMap[p.id] || "—",
      full_name: p.full_name || null
    }])
  )

  const enriched = (data ?? []).map((r: any) => ({
    ...r,
    profiles: profileMap[r.user_id] ?? {
      email: authEmailMap[r.user_id] || "—",
      full_name: null
    }
  }))

  return NextResponse.json(enriched)
}