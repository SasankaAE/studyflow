import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const [{ count: total }, { count: pro }, { count: pending }] = await Promise.all([
    supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).eq("plan", "pro"),
    supabaseAdmin.from("bank_transfer_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ])

  return NextResponse.json({
    totalUsers: total ?? 0,
    proUsers: pro ?? 0,
    pendingTransfers: pending ?? 0,
  })
}