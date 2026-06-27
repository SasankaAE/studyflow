import { NextRequest, NextResponse } from "next/server"
import { checkUsage } from "@/lib/usage"
import { createClient } from "@/lib/supabase/server"

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

export async function POST(req: NextRequest) {
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY is not configured" }, { status: 500 })
  }

  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Plan gate
  const check = await checkUsage("chat")
  if (!check.allowed) {
    return NextResponse.json({ error: check.reason }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const upstream = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      "X-Title": process.env.NEXT_PUBLIC_APP_NAME || "My App",
    },
    body: JSON.stringify(body),
  })

  if (!upstream.ok) {
    const err = await upstream.json().catch(() => ({}))
    return NextResponse.json(
      { error: err?.error?.message || "OpenRouter error" },
      { status: upstream.status }
    )
  }

  // Log activity after successful response
  const isStream = (body as Record<string, unknown>)?.stream === true
  const messages = (body as Record<string, unknown>)?.messages as { role: string; content: string }[] | undefined
  const lastUserMsg = messages?.findLast((m) => m.role === "user")?.content ?? "Chat"

  await supabase.from("activity_log").insert({
    user_id: user.id,
    type: "chat",
    title: `Chat: ${lastUserMsg.slice(0, 60)}`,
  })

  if (isStream && upstream.body) {
    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  }

  const data = await upstream.json()
  return NextResponse.json(data)
}