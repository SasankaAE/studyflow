"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  ExternalLink, RefreshCw, UserCog,
  CheckCircle, XCircle,
} from "lucide-react"
import { approveTransfer } from "../../actions"
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BankTransfersPage() {
  const supabase = createClient()

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
      body: JSON.stringify({ email: manualEmail.trim() }),
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
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setManualLoading(false)
    }
  }

  const openSlip = async (slipUrl: string) => {
    const path = slipUrl.includes("/payment-slips/")
      ? slipUrl.split("/payment-slips/")[1]
      : slipUrl
    const { data, error } = await supabase.storage
      .from("payment-slips")
      .createSignedUrl(path, 60)
    if (error || !data?.signedUrl) { toast.error("Could not open slip"); return }
    window.open(data.signedUrl, "_blank")
  }

  const handleAction = async (confirmedAction: "approve" | "reject") => {
    if (!selected) return
    setProcessing(true)
    const newStatus = confirmedAction === "approve" ? "approved" : "rejected"
    try {
      await approveTransfer(
        selected.id, selected.user_id, selected.target_plan,
        adminNotes || null, confirmedAction
      )
      setRequests((prev) =>
        prev.map((r) => r.id === selected.id ? { ...r, status: newStatus } : r)
      )
      toast.success(confirmedAction === "approve" ? "Plan upgraded to Pro." : "Request rejected.")
      setSelected(null); setAction(null); setAdminNotes("")
      fetchRequests()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setProcessing(false)
    }
  }

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
      approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    }
    return (
      <span className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        variants[status]
      )}>
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
          <p className="mt-0.5 text-sm text-muted-foreground">
            Review and approve manual payment requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline" size="sm"
            onClick={fetchRequests} disabled={loading}
            className="flex-1 sm:flex-none"
          >
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
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  No requests yet
                </TableCell>
              </TableRow>
            ) : requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {req.reference_number}
                </TableCell>
                <TableCell>
                  <p className="text-sm font-medium text-foreground">
                    {req.profiles?.full_name || req.profiles?.email || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">{req.profiles?.email}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{req.target_plan}</Badge>
                </TableCell>
                <TableCell className="text-sm font-medium text-foreground">
                  LKR {req.amount.toFixed(2)}
                </TableCell>
                <TableCell>{statusBadge(req.status)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(req.submitted_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {req.slip_url && (
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => openSlip(req.slip_url!)}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {req.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="h-7 bg-emerald-600 px-2.5 text-xs hover:bg-emerald-700"
                          onClick={() => { setSelected(req); setAction("approve") }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm" variant="destructive" className="h-7 px-2.5 text-xs"
                          onClick={() => { setSelected(req); setAction("reject") }}
                        >
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
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">Loading…</CardContent>
          </Card>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">No requests yet</CardContent>
          </Card>
        ) : requests.map((req) => (
          <Card key={req.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-muted-foreground truncate">
                  {req.reference_number}
                </span>
                {statusBadge(req.status)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {req.profiles?.full_name || "—"}
                </p>
                <p className="text-xs text-muted-foreground">{req.profiles?.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-xs text-muted-foreground">
                  Plan: <span className="capitalize text-foreground">{req.target_plan}</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  LKR <span className="text-foreground">{req.amount.toFixed(2)}</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(req.submitted_at).toLocaleDateString()}
                </span>
              </div>
              {(req.slip_url || req.status === "pending") && (
                <div className="flex gap-2 pt-1">
                  {req.slip_url && (
                    <Button
                      variant="outline" size="sm" className="h-8 flex-1 text-xs"
                      onClick={() => openSlip(req.slip_url!)}
                    >
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />View slip
                    </Button>
                  )}
                  {req.status === "pending" && (
                    <>
                      <Button
                        size="sm" className="h-8 flex-1 bg-emerald-600 text-xs hover:bg-emerald-700"
                        onClick={() => { setSelected(req); setAction("approve") }}
                      >
                        <CheckCircle className="mr-1.5 h-3.5 w-3.5" />Approve
                      </Button>
                      <Button
                        size="sm" variant="destructive" className="h-8 flex-1 text-xs"
                        onClick={() => { setSelected(req); setAction("reject") }}
                      >
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

      {/* Approve / Reject dialog */}
      <Dialog
        open={!!selected}
        onOpenChange={(o) => { if (!o) { setSelected(null); setAction(null); setAdminNotes("") } }}
      >
        <DialogContent className="mx-4 max-w-md rounded-xl sm:mx-auto">
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve payment" : "Reject request"}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1.5">
                <p>
                  <span className="text-muted-foreground">User:</span>{" "}
                  <span className="break-all text-foreground">{selected.profiles?.email}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Reference:</span>{" "}
                  <span className="font-mono text-xs break-all text-foreground">
                    {selected.reference_number}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Plan:</span> current →{" "}
                  <strong className="capitalize text-foreground">{selected.target_plan}</strong>
                </p>
              </div>
              {action === "approve" && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                  This will immediately update the user's plan to{" "}
                  <strong>{selected.target_plan}</strong>.
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Admin notes (optional)
                </Label>
                <Textarea
                  placeholder="Add a note for your records…"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="mt-1.5 text-sm"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0">
            <Button
              variant="outline" className="w-full sm:w-auto"
              onClick={() => { setSelected(null); setAction(null); setAdminNotes("") }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleAction(action!)}
              disabled={processing || !action}
              className={cn(
                "w-full sm:w-auto",
                action === "approve" && "bg-emerald-600 hover:bg-emerald-700"
              )}
              variant={action === "reject" ? "destructive" : "default"}
            >
              {processing
                ? "Processing…"
                : action === "approve"
                ? "Confirm approve"
                : "Confirm reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual plan dialog */}
      <Dialog
        open={manualOpen}
        onOpenChange={(o) => { setManualOpen(o); if (!o) { setManualEmail(""); setManualResult(null) } }}
      >
        <DialogContent className="mx-4 max-w-md rounded-xl sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Manual plan update</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p className="text-xs text-muted-foreground">
              Change any user's plan directly — e.g. after confirming a transfer manually.
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">User email</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="user@example.com"
                  value={manualEmail}
                  onChange={(e) => { setManualEmail(e.target.value); setManualResult(null) }}
                  onKeyDown={(e) => e.key === "Enter" && lookupUser()}
                  className="min-w-0 flex-1"
                />
                <Button variant="outline" onClick={lookupUser} disabled={manualLoading} className="shrink-0">
                  {manualLoading ? "…" : "Lookup"}
                </Button>
              </div>
            </div>
            {manualResult && (
              <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1">
                <p>
                  <span className="text-muted-foreground">Name:</span>{" "}
                  <span className="text-foreground">{manualResult.name}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Current plan:</span>{" "}
                  <span className="ml-1 capitalize font-medium text-foreground">
                    {manualResult.current_plan}
                  </span>
                </p>
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
              <p className="text-xs text-amber-400">
                User is already on the <strong>{manualPlan}</strong> plan.
              </p>
            )}
          </div>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setManualOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleManualUpdate}
              disabled={manualLoading || !manualResult || manualResult.current_plan === manualPlan}
              className="w-full sm:w-auto"
            >
              {manualLoading ? "Updating…" : `Set to ${manualPlan}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}