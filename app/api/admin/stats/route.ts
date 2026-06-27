import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const [
    { count: total },
    { count: pro },
    { count: free },
    { count: pending },
    { count: papers },
    { data: transfers },
  ] = await Promise.all([
    supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).eq("plan", "pro"),
    supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).eq("plan", "free"),
    supabaseAdmin.from("bank_transfer_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from("pdfs").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("bank_transfer_requests").select("amount").eq("status", "approved"),
  ])

  const totalAmount = transfers?.reduce((sum, t) => sum + (t.amount ?? 0), 0) ?? 0

  return NextResponse.json({
    totalUsers: total ?? 0,
    proUsers: pro ?? 0,
    freeUsers: free ?? 0,
    pendingTransfers: pending ?? 0,
    totalPapers: papers ?? 0,
    totalAmount,
  })
}