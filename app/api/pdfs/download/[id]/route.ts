import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { checkUsage } from "@/lib/usage"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const check = await checkUsage("paper")
  if (!check.allowed) {
    return NextResponse.json({ error: check.reason }, { status: 403 })
  }

  const { data: pdf, error } = await supabase
    .from("pdfs")
    .select("storage_path, name")
    .eq("id", id)
    .single()

  if (error || !pdf)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { data: signed, error: signError } = await supabase.storage
    .from("pdfs")
    .createSignedUrl(pdf.storage_path, 60)

  if (signError)
    return NextResponse.json({ error: signError.message }, { status: 500 })

  await supabase.from("activity_log").insert({
    user_id: user.id,
    type: "paper",
    title: `Downloaded: ${pdf.name}`,
  })

  return NextResponse.json({ url: signed.signedUrl, name: pdf.name })
}
