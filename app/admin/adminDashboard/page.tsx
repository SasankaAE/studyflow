"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { toast } from "sonner"
import {
  ExternalLink, RefreshCw, UserCog, CheckCircle, XCircle,
  Upload, FileText, X, CheckCircle2, AlertCircle,
  LayoutDashboard, CreditCard, FileUp, Menu, LogOut,
  Users, TrendingUp, Clock,
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
  { id: "overview",        label: "Overview",        icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "bank-transfers",  label: "Bank Transfers",  icon: <CreditCard className="h-4 w-4" /> },
  { id: "upload",          label: "Upload Paper",    icon: <FileUp className="h-4 w-4" /> },
]

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
    <div className="flex min-h-screen bg-[#F8F8F7]">
      {/* ── Sidebar ── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-gray-200 bg-white transition-transform duration-200 md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex h-14 items-center gap-2.5 border-b border-gray-100 px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900">
            <span className="text-[11px] font-bold text-white">SF</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">StudyFlow</p>
            <p className="text-[10px] text-gray-400 leading-tight">Admin</p>
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
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sign out */}
        <div className="border-t border-gray-100 p-3">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-gray-900">
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
      const [{ count: total }, { count: pro }, { count: pending }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("plan", "pro"),
        supabase.from("bank_transfer_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ])
      setStats({
        totalUsers: total ?? 0,
        proUsers: pro ?? 0,
        pendingTransfers: pending ?? 0,
        loading: false,
      })
    }
    load()
  }, [])

  const cards = [
    { label: "Total users",       value: stats.totalUsers,       icon: <Users className="h-4 w-4" />,      accent: "text-blue-600",  bg: "bg-blue-50" },
    { label: "Pro subscribers",   value: stats.proUsers,         icon: <TrendingUp className="h-4 w-4" />, accent: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pending transfers", value: stats.pendingTransfers, icon: <Clock className="h-4 w-4" />,      accent: "text-amber-600", bg: "bg-amber-50" },
  ]

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-0.5 text-sm text-gray-500">StudyFlow admin overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{c.label}</p>
              <span className={cn("rounded-lg p-1.5", c.bg, c.accent)}>{c.icon}</span>
            </div>
            <p className={cn("mt-3 text-3xl font-semibold", stats.loading ? "text-gray-200 animate-pulse" : "text-gray-900")}>
              {stats.loading ? "—" : c.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-gray-700">Quick actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() => onNavigate("bank-transfers")}
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-gray-300 hover:shadow-sm"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 group-hover:bg-gray-900 group-hover:text-white transition-colors">
              <CreditCard className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-gray-900">Review transfers</p>
              <p className="text-xs text-gray-400">Approve or reject payment requests</p>
            </div>
          </button>
          <button
            onClick={() => onNavigate("upload")}
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-gray-300 hover:shadow-sm"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 group-hover:bg-gray-900 group-hover:text-white transition-colors">
              <FileUp className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-gray-900">Upload paper</p>
              <p className="text-xs text-gray-400">Add a new PDF to the library</p>
            </div>
          </button>
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
    const { data, error } = await supabase
      .from("bank_transfer_requests")
      .select("*")
      .order("submitted_at", { ascending: false })

    if (error) { toast.error(error.message); setLoading(false); return }

    const userIds = [...new Set((data ?? []).map((r) => r.user_id))]
    const { data: profilesData } = await supabase
      .from("profiles").select("id, email, full_name").in("id", userIds)

    const profileMap = Object.fromEntries((profilesData ?? []).map((p) => [p.id, p]))
    setRequests((data ?? []).map((r) => ({ ...r, profiles: profileMap[r.user_id] ?? null })))
    setLoading(false)
  }

  useEffect(() => { fetchRequests() }, [])

  const lookupUser = async () => {
    if (!manualEmail.trim()) { toast.error("Enter an email"); return }
    setManualLoading(true); setManualResult(null)
    const { data, error } = await supabase
      .from("profiles").select("id, full_name, plan, email")
      .eq("email", manualEmail.trim()).single()
    if (error || !data) { toast.error("User not found") }
    else setManualResult({ name: data.full_name || data.email, current_plan: data.plan ?? "free" })
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
    const styles: Record<string, string> = {
      pending:  "bg-amber-100 text-amber-800 border-amber-200",
      approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    }
    return (
      <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", styles[status])}>
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
          <h1 className="text-xl font-semibold text-gray-900">Bank transfers</h1>
          <p className="mt-0.5 text-sm text-gray-500">Review and approve manual payment requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading} className="flex-1 sm:flex-none">
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setManualOpen(true)} className="flex-1 sm:flex-none bg-gray-900 hover:bg-gray-800">
            <UserCog className="mr-2 h-4 w-4" />
            Manual update
          </Button>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-3">
        {(["pending", "approved", "rejected"] as const).map((s) => (
          <div key={s} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-2xl font-semibold text-gray-900">{counts[s]}</p>
            <p className="mt-0.5 text-xs capitalize text-gray-400">{s}</p>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/70">
              <TableHead className="text-xs font-medium text-gray-500">Reference</TableHead>
              <TableHead className="text-xs font-medium text-gray-500">User</TableHead>
              <TableHead className="text-xs font-medium text-gray-500">Plan</TableHead>
              <TableHead className="text-xs font-medium text-gray-500">Amount</TableHead>
              <TableHead className="text-xs font-medium text-gray-500">Status</TableHead>
              <TableHead className="text-xs font-medium text-gray-500">Date</TableHead>
              <TableHead className="text-xs font-medium text-gray-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-gray-400">Loading…</TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-gray-400">No requests yet</TableCell>
              </TableRow>
            ) : requests.map((req) => (
              <TableRow key={req.id} className="hover:bg-gray-50/50">
                <TableCell className="font-mono text-xs text-gray-500">{req.reference_number}</TableCell>
                <TableCell>
                  <p className="text-sm font-medium text-gray-900">{req.profiles?.full_name || "—"}</p>
                  <p className="text-xs text-gray-400">{req.profiles?.email}</p>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-md border border-gray-200 px-2 py-0.5 text-xs font-medium capitalize text-gray-600">
                    {req.target_plan}
                  </span>
                </TableCell>
                <TableCell className="text-sm font-medium text-gray-900">LKR {req.amount.toFixed(2)}</TableCell>
                <TableCell>{statusBadge(req.status)}</TableCell>
                <TableCell className="text-xs text-gray-400">
                  {new Date(req.submitted_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {req.slip_url && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-700" onClick={() => openSlip(req.slip_url!)}>
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
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white py-10 text-center text-sm text-gray-400">Loading…</div>
        ) : requests.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white py-10 text-center text-sm text-gray-400">No requests yet</div>
        ) : requests.map((req) => (
          <div key={req.id} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-gray-400 truncate">{req.reference_number}</span>
              {statusBadge(req.status)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{req.profiles?.full_name || "—"}</p>
              <p className="text-xs text-gray-400">{req.profiles?.email}</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="text-gray-400 text-xs">Plan: <span className="capitalize text-gray-700">{req.target_plan}</span></span>
              <span className="text-gray-400 text-xs">LKR <span className="text-gray-700">{req.amount.toFixed(2)}</span></span>
              <span className="text-xs text-gray-400">{new Date(req.submitted_at).toLocaleDateString()}</span>
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
          </div>
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
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-1.5">
                <p><span className="text-gray-400">User:</span> <span className="break-all text-gray-900">{selected.profiles?.email}</span></p>
                <p><span className="text-gray-400">Reference:</span> <span className="font-mono text-xs break-all text-gray-700">{selected.reference_number}</span></p>
                <p><span className="text-gray-400">Plan:</span> current → <strong className="capitalize">{selected.target_plan}</strong></p>
              </div>
              {action === "approve" && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                  This will immediately update the user's plan to <strong>{selected.target_plan}</strong>.
                </div>
              )}
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wide">Admin notes (optional)</Label>
                <Textarea placeholder="Add a note for your records…" value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)} className="mt-1.5 text-sm" rows={3} />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => { setSelected(null); setAction(null); setAdminNotes("") }}>
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
      <Dialog open={manualOpen} onOpenChange={(o) => { setManualOpen(o); setManualEmail(""); setManualResult(null) }}>
        <DialogContent className="mx-4 max-w-md rounded-xl sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Manual plan update</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p className="text-xs text-gray-400">Change any user's plan directly — e.g. after confirming a transfer manually.</p>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-gray-400">User email</Label>
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
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-1 text-sm">
                <p><span className="text-gray-400">Name:</span> <span className="text-gray-900">{manualResult.name}</span></p>
                <p><span className="text-gray-400">Current plan:</span> <span className="ml-1 capitalize font-medium text-gray-900">{manualResult.current_plan}</span></p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-gray-400">Set plan to</Label>
              <Select value={manualPlan} onValueChange={(v) => setManualPlan(v as "free" | "pro")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {manualResult?.current_plan === manualPlan && (
              <p className="text-xs text-amber-600">User is already on the <strong>{manualPlan}</strong> plan.</p>
            )}
          </div>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setManualOpen(false)}>Cancel</Button>
            <Button onClick={handleManualUpdate}
              disabled={manualLoading || !manualResult || manualResult.current_plan === manualPlan}
              className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800">
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
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Upload paper</h1>
        <p className="mt-0.5 text-sm text-gray-500">Admin only — uploaded PDFs are visible to all users.</p>
      </div>

      {/* Drop zone */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="mb-3 text-sm font-medium text-gray-700">PDF file</p>
        <div
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors",
            dragging ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50",
            file && "border-gray-900 border-solid bg-gray-50"
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
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-900">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 max-w-xs">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 ml-2 shrink-0 text-gray-400 hover:text-red-500"
                onClick={(e) => { e.stopPropagation(); setFile(null) }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <Upload className="h-5 w-5 text-gray-500" />
              </div>
              <p className="text-sm text-gray-500">
                Drop a PDF here or{" "}
                <span className="font-medium text-gray-900 underline underline-offset-2">browse files</span>
              </p>
              <p className="text-xs text-gray-400">PDF only · max 50 MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <p className="text-sm font-medium text-gray-700">Metadata</p>
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs uppercase tracking-wide text-gray-400">Title</Label>
          <Input id="name" placeholder="Attention Is All You Need" value={form.name} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="year" className="text-xs uppercase tracking-wide text-gray-400">Year</Label>
            <Input id="year" type="number" placeholder="2024" value={form.year} onChange={handleChange} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-gray-400">Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NLP">NLP</SelectItem>
                <SelectItem value="CV">Computer Vision</SelectItem>
                <SelectItem value="LLM">LLMs</SelectItem>
                <SelectItem value="Safety">Safety</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />PDF uploaded successfully.
        </div>
      )}

      <Button className="w-full bg-gray-900 hover:bg-gray-800" size="lg" disabled={!file || uploading} onClick={handleSubmit}>
        {uploading ? "Uploading…" : "Upload PDF"}
      </Button>
    </div>
  )
}