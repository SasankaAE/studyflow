import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File
  if (!file)
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDFs allowed" }, { status: 400 })
  }

  const storagePath = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`

  const { error: uploadError } = await supabase.storage
    .from("pdfs")
    .upload(storagePath, file, { contentType: "application/pdf" })

  if (uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const name = (formData.get("name") as string) || file.name
  const category = formData.get("category") as string | null
  const year = formData.get("year") ? Number(formData.get("year")) : null
  const size = formData.get("size") as string | null

  const { error: dbError } = await supabase.from("pdfs").insert({
    name,
    storage_path: storagePath,
    uploaded_by: user.id,
    category,
    year,
    size,
  })

  if (dbError)
    return NextResponse.json({ error: dbError.message }, { status: 500 })

  return NextResponse.json({ success: true }, { status: 201 })
}
