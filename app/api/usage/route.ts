import { NextResponse } from "next/server"
import { checkUsage } from "@/lib/usage"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") as "chat" | "paper"

  if (!type) return NextResponse.json({ allowed: false, reason: "Missing type" }, { status: 400 })

  const result = await checkUsage(type)
  return NextResponse.json(result)
}