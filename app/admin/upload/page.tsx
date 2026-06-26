"use client"

import { useState, useRef, useCallback } from "react"
import { useUploadPdf } from "@/hooks/useUploadPdf"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export default function UploadPdfPage() {
  const { upload, uploading, error, success } = useUploadPdf()
  const router = useRouter()

  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [form, setForm] = useState({ name: "", year: "", category: "" })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") return
    setFile(f)
    if (!form.name) {
      setForm((prev) => ({
        ...prev,
        name: f.name.replace(/\.pdf$/i, "").replace(/_/g, " "),
      }))
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [form.name])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }))
  }


  const handleSubmit = async () => {
    if (!file) return
    const ok = await upload(file, {
      name: form.name || file.name,
      year: form.year ? Number(form.year) : undefined,
      category: form.category || undefined,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
    })
    if (ok) {
      setFile(null)
      setForm({ name: "", year: "", category: "" })
      router.refresh()
    }
  }

  return (
    <div className="p-6 space-y-4 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Upload paper</h2>
        <p className="text-sm text-muted-foreground">Admin only — uploaded files are available to all users.</p>
      </div>

      {/* Drop zone card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">PDF file</CardTitle>
          <CardDescription className="text-xs">Only .pdf files accepted. Max 50 MB.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30",
              file && "border-primary/60 bg-primary/5 border-solid"
            )}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-7 w-7 text-primary shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium truncate max-w-xs">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 ml-2 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); setFile(null) }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-7 w-7 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drop a PDF here or <span className="text-foreground underline underline-offset-2">browse files</span>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metadata card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Metadata</CardTitle>
          <CardDescription className="text-xs">Shown to users in the papers list.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs uppercase tracking-wide text-muted-foreground">Title</Label>
            <Input id="name" placeholder="Attention Is All You Need"
              value={form.name} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="year" className="text-xs uppercase tracking-wide text-muted-foreground">Year</Label>
              <Input id="year" type="number" placeholder="2024"
                value={form.year} onChange={handleChange} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grade 6 CS">Grade 6 CS</SelectItem>
                  <SelectItem value="Grade 7 CS">Grade 7 CS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2.5 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-500/10 px-3 py-2.5 rounded-md">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          PDF uploaded successfully.
        </div>
      )}

      <Button className="w-full" size="lg" disabled={!file || uploading} onClick={handleSubmit}>
        {uploading ? "Uploading…" : "Upload PDF"}
      </Button>
    </div>
  )
}