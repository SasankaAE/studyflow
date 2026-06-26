"use client"

import { useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Upload, FileText, X, CheckCircle2, AlertCircle,
} from "lucide-react"
import { useUploadPdf } from "@/hooks/useUploadPdf"
import { cn } from "@/lib/utils"

// ─── Upload page ──────────────────────────────────────────────────────────────

export default function UploadPage() {
  const { upload, uploading, error, success } = useUploadPdf()
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [form, setForm] = useState({ name: "", year: "", category: "" })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") return
    setFile(f)
    if (!form.name)
      setForm((p) => ({ ...p, name: f.name.replace(/\.pdf$/i, "").replace(/_/g, " ") }))
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault(); setDragging(false)
      const f = e.dataTransfer.files[0]
      if (f) handleFile(f)
    },
    [form.name]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.id]: e.target.value }))

  const handleSubmit = async () => {
    if (!file) return
    const ok = await upload(file, {
      name: form.name || file.name,
      year: form.year ? Number(form.year) : undefined,
      category: form.category || undefined,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
    })
    if (ok) { setFile(null); setForm({ name: "", year: "", category: "" }) }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Upload paper</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Admin only — uploaded PDFs are visible to all users.
        </p>
      </div>

      {/* Drop zone */}
      <Card>
        <CardContent className="p-5">
          <p className="mb-3 text-sm font-medium text-foreground">PDF file</p>
          <div
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors",
              dragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/50 hover:bg-accent/30",
              file && "border-primary border-solid bg-primary/5"
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
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary">
                  <FileText className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground max-w-xs">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 ml-2 shrink-0 hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); setFile(null) }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Drop a PDF here or{" "}
                  <span className="font-medium text-foreground underline underline-offset-2">
                    browse files
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">PDF only · max 50 MB</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="text-sm font-medium text-foreground">Metadata</p>
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs uppercase tracking-wide text-muted-foreground">
              Title
            </Label>
            <Input id="name" placeholder="Attention Is All You Need" value={form.name} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="year" className="text-xs uppercase tracking-wide text-muted-foreground">
                Year
              </Label>
              <Input id="year" type="number" placeholder="2024" value={form.year} onChange={handleChange} />
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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>PDF uploaded successfully.</AlertDescription>
        </Alert>
      )}

      <Button className="w-full" size="lg" disabled={!file || uploading} onClick={handleSubmit}>
        {uploading ? "Uploading…" : "Upload PDF"}
      </Button>
    </div>
  )
}