"use client"

import { useEffect, useState } from "react"

type Pdf = {
  id: string
  name: string
  created_at: string
  category?: string
  year?: number
  size?: string
}

export function usePdfs() {
  const [pdfs, setPdfs] = useState<Pdf[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/pdfs")
      .then((r) => r.json())
      .then((d) => setPdfs(d.pdfs ?? []))
      .finally(() => setLoading(false))
  }, [])

  const download = async (id: string, name: string) => {
  const res = await fetch(`/api/pdfs/download/${id}`)
  const data = await res.json()

  if (!res.ok) {
    alert(data.error) // or wire to a toast if you have one
    return
  }

  const a = document.createElement("a")
  a.href = data.url
  a.download = name
  a.click()
}

  return { pdfs, loading, download }
}