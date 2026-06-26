"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import {
  ExternalLink, RefreshCw, UserCog, CheckCircle, XCircle,
  Upload, FileText, X, CheckCircle2, AlertCircle,
  LayoutDashboard, CreditCard, FileUp, Menu, LogOut,
  Users, TrendingUp, Clock, ShieldAlert,
} from "lucide-react"
import { approveTransfer } from "../actions"
import { useUploadPdf } from "@/hooks/useUploadPdf"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type TransferRequest = {
  id: string
  user_id: string
  reference_number: string
  amount: number
  target_plan: string
  slip_url: string | null
  status: "pending" | "approved" | "rejected"
  notes: string | null
  submitted_at: string
  reviewed_at: string | null
  profiles: { email: string; full_name: string | null } | null
}

type Section = "overview" | "bank-transfers" | "upload"

const NAV: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "overview",       label: "Overview",       icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "bank-transfers", label: "Bank Transfers",  icon: <CreditCard className="h-4 w-4" /> },
  { id: "upload",         label: "Upload Paper",    icon: <FileUp className="h-4 w-4" /> },
]

// ─── Logo ─────────────────────────────────────────────────────────────────────

function StudyFlowLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-primary", className)}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [section, setSection] = useState<Section>("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/admin/login"
  }

  return (
    <div className="dark flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-border bg-card transition-transform duration-200 md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex h-14 items-center gap-2.5 border-b border-border px-5">
          <StudyFlowLogo className="h-6 w-6" />
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">StudyFlow</p>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldAlert className="h-2.5 w-2.5 text-red-400" />
              <p className="text-[10px] text-red-400 leading-tight font-medium">Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => { setSection(item.id); setSidebarOpen(false) }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                section === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sign out */}
        <div className="border-t border-border p-3">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="flex h-14 items-center gap-3 border-b border-border bg-card px-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-sm font-semibold text-foreground">
            {NAV.find((n) => n.id === section)?.label}
          </span>
        </header>

        {/* Section content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {section === "overview"       && <OverviewSection supabase={supabase} onNavigate={setSection} />}
          {section === "bank-transfers" && <BankTransfersSection supabase={supabase} />}
          {section === "upload"         && <UploadSection />}
        </main>
      </div>
    </div>
  )
}

// ─── Overview ─────────────────────────────────────────────────────────────────

function OverviewSection({
  supabase,
  onNavigate,
}: {
  supabase: ReturnType<typeof createClient>
  onNavigate: (s: Section) => void
}) {
  const [stats, setStats] = useState({
    totalUsers: 0, proUsers: 0, pendingTransfers: 0, loading: true,
  })

  useEffect(() => {
  async function load() {
    const res = await fetch("/api/admin/stats")
    const data = await res.json()
    setStats({ ...data, loading: false })
  }
  load()
}, [])

  const cards = [
    { label: "Total users",       value: stats.totalUsers,       icon: <Users className="h-4 w-4" />,      badgeClass: "bg-blue-500/10 text-blue-400" },
    { label: "Pro subscribers",   value: stats.proUsers,         icon: <TrendingUp className="h-4 w-4" />, badgeClass: "bg-emerald-500/10 text-emerald-400" },
    { label: "Pending transfers", value: stats.pendingTransfers, icon: <Clock className="h-4 w-4" />,      badgeClass: "bg-amber-500/10 text-amber-400" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">StudyFlow admin overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{c.label}</p>
                <span className={cn("rounded-lg p-1.5", c.badgeClass)}>{c.icon}</span>
              </div>
              <p className={cn("mt-3 text-3xl font-semibold", stats.loading ? "text-muted animate-pulse" : "text-foreground")}>
                {stats.loading ? "—" : c.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Quick actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            {
              section: "bank-transfers" as Section,
              icon: <CreditCard className="h-4 w-4" />,
              title: "Review transfers",
              desc: "Approve or reject payment requests",
            },
            {
              section: "upload" as Section,
              icon: <FileUp className="h-4 w-4" />,
              title: "Upload paper",
              desc: "Add a new PDF to the library",
            },
          ].map((item) => (
            <button
              key={item.section}
              onClick={() => onNavigate(item.section)}
              className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary/50 hover:bg-accent"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {item.icon}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Bank Transfers ────────────────────────────────────────────────────────────

function BankTransfersSection({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [requests, setRequests] = useState<TransferRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<TransferRequest | null>(null)
  const [action, setAction] = useState<"approve" | "reject" | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [processing, setProcessing] = useState(false)

  const [manualOpen, setManualOpen] = useState(false)
  const [manualEmail, setManualEmail] = useState("")
  const [manualPlan, setManualPlan] = useState<"free" | "pro">("pro")
  const [manualLoading, setManualLoading] = useState(false)
  const [manualResult, setManualResult] = useState<{ name: string; current_plan: string } | null>(null)

 const fetchRequests = async () => {
  setLoading(true)
  const res = await fetch("/api/admin/transfer-requests")
  if (!res.ok) { toast.error("Failed to load requests"); setLoading(false); return }
  const data = await res.json()
  setRequests(data)
  setLoading(false)
}

useEffect(() => { fetchRequests() }, [])

 const lookupUser = async () => {
  if (!manualEmail.trim()) { toast.error("Enter an email"); return }
  setManualLoading(true); setManualResult(null)

  const res = await fetch("/api/admin/lookup-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: manualEmail.trim() })
  })

  if (!res.ok) { toast.error("User not found") }
  else {
    const data = await res.json()
    setManualResult({ name: data.name, current_plan: data.current_plan })
  }
  setManualLoading(false)
}

  const handleManualUpdate = async () => {
    if (!manualEmail.trim() || !manualResult) return
    setManualLoading(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ plan: manualPlan, plan_updated_at: new Date().toISOString() })
        .eq("email", manualEmail.trim())
      if (error) throw error
      toast.success(`${manualResult.name}'s plan updated to ${manualPlan}`)
      setManualOpen(false); setManualEmail(""); setManualResult(null)
      fetchRequests()
    } catch (err: any) { toast.error(err.message) }
    finally { setManualLoading(false) }
  }

  const openSlip = async (slipUrl: string) => {
    const path = slipUrl.includes("/payment-slips/") ? slipUrl.split("/payment-slips/")[1] : slipUrl
    const { data, error } = await supabase.storage.from("payment-slips").createSignedUrl(path, 60)
    if (error || !data?.signedUrl) { toast.error("Could not open slip"); return }
    window.open(data.signedUrl, "_blank")
  }

  const handleAction = async (confirmedAction: "approve" | "reject") => {
    if (!selected) return
    setProcessing(true)
    const newStatus = confirmedAction === "approve" ? "approved" : "rejected"
    try {
      await approveTransfer(selected.id, selected.user_id, selected.target_plan, adminNotes || null, confirmedAction)
      setRequests((prev) => prev.map((r) => r.id === selected.id ? { ...r, status: newStatus } : r))
      toast.success(confirmedAction === "approve" ? "Plan upgraded to Pro." : "Request rejected.")
      setSelected(null); setAction(null); setAdminNotes("")
      fetchRequests()
    } catch (err: any) { toast.error(err.message) }
    finally { setProcessing(false) }
  }

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
      approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    }
    return (
      <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", variants[status])}>
        {status}
      </span>
    )
  }

  const counts = {
    pending:  requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Bank transfers</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Review and approve manual payment requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading} className="flex-1 sm:flex-none">
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setManualOpen(true)} className="flex-1 sm:flex-none">
            <UserCog className="mr-2 h-4 w-4" />
            Manual update
          </Button>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-3">
        {(["pending", "approved", "rejected"] as const).map((s) => (
          <Card key={s}>
            <CardContent className="p-4">
              <p className="text-2xl font-semibold text-foreground">{counts[s]}</p>
              <p className="mt-0.5 text-xs capitalize text-muted-foreground">{s}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop table */}
      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">Loading…</TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">No requests yet</TableCell>
              </TableRow>
            ) : requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{req.reference_number}</TableCell>
                <TableCell>
                  <p className="text-sm font-medium text-foreground">{req.profiles?.full_name || req.profiles?.email || "—"}</p>
                  <p className="text-xs text-muted-foreground">{req.profiles?.email}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{req.target_plan}</Badge>
                </TableCell>
                <TableCell className="text-sm font-medium text-foreground">LKR {req.amount.toFixed(2)}</TableCell>
                <TableCell>{statusBadge(req.status)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(req.submitted_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {req.slip_url && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openSlip(req.slip_url!)}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {req.status === "pending" && (
                      <>
                        <Button size="sm" className="h-7 bg-emerald-600 px-2.5 text-xs hover:bg-emerald-700"
                          onClick={() => { setSelected(req); setAction("approve") }}>
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" className="h-7 px-2.5 text-xs"
                          onClick={() => { setSelected(req); setAction("reject") }}>
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Loading…</CardContent></Card>
        ) : requests.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No requests yet</CardContent></Card>
        ) : requests.map((req) => (
          <Card key={req.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-muted-foreground truncate">{req.reference_number}</span>
                {statusBadge(req.status)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{req.profiles?.full_name || "—"}</p>
                <p className="text-xs text-muted-foreground">{req.profiles?.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-xs text-muted-foreground">Plan: <span className="capitalize text-foreground">{req.target_plan}</span></span>
                <span className="text-xs text-muted-foreground">LKR <span className="text-foreground">{req.amount.toFixed(2)}</span></span>
                <span className="text-xs text-muted-foreground">{new Date(req.submitted_at).toLocaleDateString()}</span>
              </div>
              {(req.slip_url || req.status === "pending") && (
                <div className="flex gap-2 pt-1">
                  {req.slip_url && (
                    <Button variant="outline" size="sm" className="h-8 flex-1 text-xs" onClick={() => openSlip(req.slip_url!)}>
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />View slip
                    </Button>
                  )}
                  {req.status === "pending" && (
                    <>
                      <Button size="sm" className="h-8 flex-1 bg-emerald-600 text-xs hover:bg-emerald-700"
                        onClick={() => { setSelected(req); setAction("approve") }}>
                        <CheckCircle className="mr-1.5 h-3.5 w-3.5" />Approve
                      </Button>
                      <Button size="sm" variant="destructive" className="h-8 flex-1 text-xs"
                        onClick={() => { setSelected(req); setAction("reject") }}>
                        <XCircle className="mr-1.5 h-3.5 w-3.5" />Reject
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Approve/Reject dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) { setSelected(null); setAction(null); setAdminNotes("") } }}>
        <DialogContent className="mx-4 max-w-md rounded-xl sm:mx-auto">
          <DialogHeader>
            <DialogTitle>{action === "approve" ? "Approve payment" : "Reject request"}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1.5">
                <p><span className="text-muted-foreground">User:</span> <span className="break-all text-foreground">{selected.profiles?.email}</span></p>
                <p><span className="text-muted-foreground">Reference:</span> <span className="font-mono text-xs break-all text-foreground">{selected.reference_number}</span></p>
                <p><span className="text-muted-foreground">Plan:</span> current → <strong className="capitalize text-foreground">{selected.target_plan}</strong></p>
              </div>
              {action === "approve" && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                  This will immediately update the user's plan to <strong>{selected.target_plan}</strong>.
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Admin notes (optional)</Label>
                <Textarea placeholder="Add a note for your records…" value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)} className="mt-1.5 text-sm" rows={3} />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0">
            <Button variant="outline" className="w-full sm:w-auto"
              onClick={() => { setSelected(null); setAction(null); setAdminNotes("") }}>
              Cancel
            </Button>
            <Button onClick={() => handleAction(action!)} disabled={processing || !action}
              className={cn("w-full sm:w-auto", action === "approve" && "bg-emerald-600 hover:bg-emerald-700")}
              variant={action === "reject" ? "destructive" : "default"}>
              {processing ? "Processing…" : action === "approve" ? "Confirm approve" : "Confirm reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual plan dialog */}
      <Dialog open={manualOpen} onOpenChange={(o) => { setManualOpen(o); if (!o) { setManualEmail(""); setManualResult(null) } }}>
        <DialogContent className="mx-4 max-w-md rounded-xl sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Manual plan update</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p className="text-xs text-muted-foreground">Change any user's plan directly — e.g. after confirming a transfer manually.</p>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">User email</Label>
              <div className="flex gap-2">
                <Input placeholder="user@example.com" value={manualEmail}
                  onChange={(e) => { setManualEmail(e.target.value); setManualResult(null) }}
                  onKeyDown={(e) => e.key === "Enter" && lookupUser()}
                  className="min-w-0 flex-1" />
                <Button variant="outline" onClick={lookupUser} disabled={manualLoading} className="shrink-0">
                  {manualLoading ? "…" : "Lookup"}
                </Button>
              </div>
            </div>
            {manualResult && (
              <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1">
                <p><span className="text-muted-foreground">Name:</span> <span className="text-foreground">{manualResult.name}</span></p>
                <p><span className="text-muted-foreground">Current plan:</span> <span className="ml-1 capitalize font-medium text-foreground">{manualResult.current_plan}</span></p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Set plan to</Label>
              <Select value={manualPlan} onValueChange={(v) => setManualPlan(v as "free" | "pro")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {manualResult?.current_plan === manualPlan && (
              <p className="text-xs text-amber-400">User is already on the <strong>{manualPlan}</strong> plan.</p>
            )}
          </div>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setManualOpen(false)}>Cancel</Button>
            <Button onClick={handleManualUpdate}
              disabled={manualLoading || !manualResult || manualResult.current_plan === manualPlan}
              className="w-full sm:w-auto">
              {manualLoading ? "Updating…" : `Set to ${manualPlan}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Upload Paper ─────────────────────────────────────────────────────────────

function UploadSection() {
  const { upload, uploading, error, success } = useUploadPdf()
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [form, setForm] = useState({ name: "", year: "", category: "" })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") return
    setFile(f)
    if (!form.name) setForm((p) => ({ ...p, name: f.name.replace(/\.pdf$/i, "").replace(/_/g, " ") }))
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [form.name])

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
        <p className="mt-0.5 text-sm text-muted-foreground">Admin only — uploaded PDFs are visible to all users.</p>
      </div>

      {/* Drop zone */}
      <Card>
        <CardContent className="p-5">
          <p className="mb-3 text-sm font-medium text-foreground">PDF file</p>
          <div
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors",
              dragging ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50 hover:bg-accent/30",
              file && "border-primary border-solid bg-primary/5"
            )}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {file ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary">
                  <FileText className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground max-w-xs">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 ml-2 shrink-0 hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); setFile(null) }}>
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
                  <span className="font-medium text-foreground underline underline-offset-2">browse files</span>
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
            <Label htmlFor="name" className="text-xs uppercase tracking-wide text-muted-foreground">Title</Label>
            <Input id="name" placeholder="Attention Is All You Need" value={form.name} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="year" className="text-xs uppercase tracking-wide text-muted-foreground">Year</Label>
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