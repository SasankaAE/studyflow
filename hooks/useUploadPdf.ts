"use client"

import { useState } from "react"

type PdfMetadata = {
  name: string
  category?: string
  year?: number
  size?: string
}

export function useUploadPdf() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const upload = async (file: File, metadata: PdfMetadata) => {
    setError(null)
    setSuccess(false)
    setUploading(true)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("name", metadata.name)
    if (metadata.category) formData.append("category", metadata.category)
    if (metadata.year)     formData.append("year", String(metadata.year))
    if (metadata.size)     formData.append("size", metadata.size)

    const res = await fetch("/api/pdfs/upload", { method: "POST", body: formData })
    const data = await res.json()

    setUploading(false)

    if (!res.ok) {
      setError(data.error)
      return false
    }

    setSuccess(true)
    return true
  }

  return { upload, uploading, error, success }
}