"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  ExternalLink,
  RefreshCw,
  UserCog,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { approveTransfer } from "../actions"

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

export default function AdminBankTransfersPage() {
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
  const [manualResult, setManualResult] = useState<{
    name: string
    current_plan: string
  } | null>(null)

  const fetchRequests = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("bank_transfer_requests")
      .select("*")
      .order("submitted_at", { ascending: false })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    const userIds = [...new Set((data ?? []).map((r) => r.user_id))]
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", userIds)

    const profileMap = Object.fromEntries(
      (profilesData ?? []).map((p) => [p.id, p])
    )

    setRequests(
      (data ?? []).map((r) => ({
        ...r,
        profiles: profileMap[r.user_id] ?? null,
      }))
    )
    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const lookupUser = async () => {
    if (!manualEmail.trim()) {
      toast.error("Enter an email")
      return
    }
    setManualLoading(true)
    setManualResult(null)
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, plan, email")
      .eq("email", manualEmail.trim())
      .single()
    if (error || !data) {
      toast.error("User not found")
    } else {
      setManualResult({
        name: data.full_name || data.email,
        current_plan: data.plan ?? "free",
      })
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
      setManualOpen(false)
      setManualEmail("")
      setManualResult(null)
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
    if (error || !data?.signedUrl) {
      toast.error("Could not open slip")
      return
    }
    window.open(data.signedUrl, "_blank")
  }

  const handleAction = async (confirmedAction: "approve" | "reject") => {
    if (!selected) return
    setProcessing(true)
    const newStatus = confirmedAction === "approve" ? "approved" : "rejected"

    try {
      await approveTransfer(
        selected.id,
        selected.user_id,
        selected.target_plan,
        adminNotes || null,
        confirmedAction
      )

      setRequests((prev) =>
        prev.map((r) =>
          r.id === selected.id ? { ...r, status: newStatus } : r
        )
      )

      toast.success(
        confirmedAction === "approve"
          ? "✅ Plan upgraded to Pro!"
          : "Request rejected."
      )
      setSelected(null)
      setAction(null)
      setAdminNotes("")
      fetchRequests()
    } catch (err: any) {
      alert(`ERROR: ${err.message}`)
      toast.error(err.message)
    } finally {
      setProcessing(false)
    }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      approved:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }
    return (
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${map[status]}`}
      >
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">
            Bank Transfer Requests
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and approve manual payment requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRequests}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setManualOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <UserCog className="mr-2 h-4 w-4" />
            Manual Update
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {(["pending", "approved", "rejected"] as const).map((s) => (
          <Card key={s}>
            <CardContent className="p-3 pt-3 sm:pt-4">
              <p className="text-xl font-bold sm:text-2xl">
                {requests.filter((r) => r.status === s).length}
              </p>
              <p className="text-xs text-muted-foreground capitalize sm:text-sm">
                {s}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
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
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No requests yet
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-mono text-xs">
                      {req.reference_number}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">
                        {req.profiles?.full_name || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {req.profiles?.email}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {req.target_plan}
                      </Badge>
                    </TableCell>
                    <TableCell>LKR {req.amount.toFixed(2)}</TableCell>
                    <TableCell>{statusBadge(req.status)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(req.submitted_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {req.slip_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openSlip(req.slip_url!)}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {req.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="h-7 bg-green-600 text-xs hover:bg-green-700"
                              onClick={() => {
                                setSelected(req)
                                setAction("approve")
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 text-xs"
                              onClick={() => {
                                setSelected(req)
                                setAction("reject")
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Loading...
            </CardContent>
          </Card>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No requests yet
            </CardContent>
          </Card>
        ) : (
          requests.map((req) => (
            <Card key={req.id}>
              <CardContent className="space-y-3 p-4">
                {/* Top row: ref + status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-mono text-xs text-muted-foreground">
                    {req.reference_number}
                  </span>
                  {statusBadge(req.status)}
                </div>

                {/* User info */}
                <div>
                  <p className="text-sm font-medium">
                    {req.profiles?.full_name || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {req.profiles?.email}
                  </p>
                </div>

                {/* Plan + amount + date */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span>
                    <span className="text-muted-foreground">Plan: </span>
                    <Badge variant="outline" className="ml-1 capitalize">
                      {req.target_plan}
                    </Badge>
                  </span>
                  <span>
                    <span className="text-muted-foreground">Amount: </span>
                    LKR {req.amount.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(req.submitted_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                {(req.slip_url || req.status === "pending") && (
                  <div className="flex gap-2 pt-1">
                    {req.slip_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 flex-1 text-xs"
                        onClick={() => openSlip(req.slip_url!)}
                      >
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                        View Slip
                      </Button>
                    )}
                    {req.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="h-9 flex-1 bg-green-600 text-xs hover:bg-green-700"
                          onClick={() => {
                            setSelected(req)
                            setAction("approve")
                          }}
                        >
                          <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-9 flex-1 text-xs"
                          onClick={() => {
                            setSelected(req)
                            setAction("reject")
                          }}
                        >
                          <XCircle className="mr-1.5 h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Approve/Reject Dialog */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null)
            setAction(null)
            setAdminNotes("")
          }
        }}
      >
        <DialogContent className="mx-4 max-w-md rounded-lg sm:mx-auto">
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve Payment" : "Reject Request"}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <p>
                <span className="text-muted-foreground">User:</span>{" "}
                <span className="break-all">{selected.profiles?.email}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Reference:</span>{" "}
                <span className="font-mono text-xs break-all">
                  {selected.reference_number}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Plan change:</span>{" "}
                current → <strong>{selected.target_plan}</strong>
              </p>
              {action === "approve" && (
                <div className="rounded border border-green-200 bg-green-50 p-3 text-xs text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                  This will immediately update the user's plan to{" "}
                  <strong>{selected.target_plan}</strong>.
                </div>
              )}
              <div>
                <Label>Admin Notes (optional)</Label>
                <Textarea
                  placeholder="Add a note for your records..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="mt-1 text-sm"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setSelected(null)
                setAction(null)
                setAdminNotes("")
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleAction(action!)}
              disabled={processing || !action}
              className={`w-full sm:w-auto ${action === "approve" ? "bg-green-600 hover:bg-green-700" : ""}`}
              variant={action === "reject" ? "destructive" : "default"}
            >
              {processing
                ? "Processing..."
                : action === "approve"
                  ? "Confirm Approve"
                  : "Confirm Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Plan Update Dialog */}
      <Dialog
        open={manualOpen}
        onOpenChange={(o) => {
          setManualOpen(o)
          setManualEmail("")
          setManualResult(null)
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-lg p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Manual Plan Update</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <p className="text-xs text-muted-foreground">
              Use this to manually change any user's plan — e.g. after
              confirming a bank transfer directly.
            </p>

            <div className="space-y-1.5">
              <Label>User Email</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="user@example.com"
                  value={manualEmail}
                  onChange={(e) => {
                    setManualEmail(e.target.value)
                    setManualResult(null)
                  }}
                  onKeyDown={(e) => e.key === "Enter" && lookupUser()}
                  className="min-w-0 flex-1"
                />
                <Button
                  variant="outline"
                  onClick={lookupUser}
                  disabled={manualLoading}
                  className="w-20 shrink-0"
                >
                  {manualLoading ? "..." : "Lookup"}
                </Button>
              </div>
            </div>

            {manualResult && (
              <div className="space-y-1.5 rounded-md bg-muted p-3 text-sm">
                <p className="flex flex-wrap items-center gap-x-1">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{manualResult.name}</span>
                </p>
                <p className="flex flex-wrap items-center gap-x-1">
                  <span className="text-muted-foreground">Current plan:</span>
                  <Badge variant="outline" className="capitalize">
                    {manualResult.current_plan}
                  </Badge>
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Set Plan To</Label>
              <Select
                value={manualPlan}
                onValueChange={(v) => setManualPlan(v as "free" | "pro")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {manualResult && manualResult.current_plan === manualPlan && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                ⚠ User is already on the <strong>{manualPlan}</strong> plan.
              </p>
            )}
          </div>

          <DialogFooter className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setManualOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleManualUpdate}
              disabled={
                manualLoading ||
                !manualResult ||
                manualResult.current_plan === manualPlan
              }
              className="w-full sm:w-auto"
            >
              {manualLoading ? "Updating..." : `Set to ${manualPlan}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
