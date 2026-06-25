import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { email } = await req.json()

  // 1. Find user in auth.users by email
  const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers()
  const authUser = users.find(u => u.email === email.trim())

  if (!authUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

  // 2. Get profile by id
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("full_name, plan, email")
    .eq("id", authUser.id)
    .single()

  return NextResponse.json({
    name: profile?.full_name || profile?.email || authUser.email,
    current_plan: profile?.plan ?? "free"
  })
}