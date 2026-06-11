import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // TODO: verify payment here (PayHere / Stripe webhook sets this)
  // For now, manual upgrade:
  await supabase.from("profiles").update({ plan: "pro" }).eq("id", user.id)

  return NextResponse.json({ success: true })
}