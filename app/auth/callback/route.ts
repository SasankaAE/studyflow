import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"
  const plan = searchParams.get("plan") // ← grab plan param

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if this is a new user (no profile yet)
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .single()

      if (!profile) {
        // New user via login page — sign out and redirect to signup
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/signup?error=no_account`)
      }

      // ↓ Existing user — check if they came from ?plan=pro
      if (plan === "pro") {
        return NextResponse.redirect(`${origin}/upgrade/bank-transfer`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}