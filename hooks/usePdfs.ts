"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"

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

  const fetchPdfs = useCallback(() => {
    setLoading(true)
    fetch("/api/pdfs")
      .then((r) => r.json())
      .then((d) => setPdfs(d.pdfs ?? []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchPdfs()
  }, [fetchPdfs])

  const download = async (id: string, name: string) => {
    const res = await fetch(`/api/pdfs/download/${id}`)
    const data = await res.json()

    if (!res.ok) {
      toast.error(data.error, {
        description:
          res.status === 403 ? "Upgrade to Pro for more downloads." : undefined,
      })
      return
    }

    const a = document.createElement("a")
    a.href = data.url
    a.download = name
    a.click()
  }

  return { pdfs, loading, download, refetch: fetchPdfs }
}
