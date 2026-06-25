import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { email } = await req.json()

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, plan")
    .eq("email", email.trim())
    .single()

  if (error || !profile) {
    // fallback: search auth.users directly
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
    const authUser = users.find(u => u.email === email.trim())
    if (!authUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

    return NextResponse.json({
      name: authUser.email,
      current_plan: "free"
    })
  }

  return NextResponse.json({
    name: profile.full_name || email,
    current_plan: profile.plan ?? "free"
  })
}