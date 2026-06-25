"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ExternalLink, RefreshCw, UserCog } from "lucide-react";

type TransferRequest = {
  id: string;
  user_id: string;
  reference_number: string;
  amount: number;
  target_plan: string;
  slip_url: string | null;
  status: "pending" | "approved" | "rejected";
  notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  profiles: { email: string; full_name: string | null } | null;
};

export default function AdminBankTransfersPage() {
  const supabase = createClient();
  const [requests, setRequests] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Transfer request approve/reject
  const [selected, setSelected] = useState<TransferRequest | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  // Manual plan update
  const [manualOpen, setManualOpen] = useState(false);
  const [manualEmail, setManualEmail] = useState("");
  const [manualPlan, setManualPlan] = useState<"free" | "pro">("pro");
  const [manualLoading, setManualLoading] = useState(false);
  const [manualResult, setManualResult] = useState<{ name: string; current_plan: string } | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bank_transfer_requests")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) { toast.error(error.message); setLoading(false); return; }

    const userIds = [...new Set((data ?? []).map((r) => r.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", userIds);

    const profileMap = Object.fromEntries(
      (profilesData ?? []).map((p) => [p.id, p])
    );

    setRequests(
      (data ?? []).map((r) => ({
        ...r,
        profiles: profileMap[r.user_id] ?? null,
      }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  // Lookup user by email before committing manual update
  const lookupUser = async () => {
    if (!manualEmail.trim()) { toast.error("Enter an email"); return; }
    setManualLoading(true);
    setManualResult(null);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, plan, email")
      .eq("email", manualEmail.trim())
      .single();
    if (error || !data) {
      toast.error("User not found");
    } else {
      setManualResult({ name: data.full_name || data.email, current_plan: data.plan ?? "free" });
    }
    setManualLoading(false);
  };

  const handleManualUpdate = async () => {
    if (!manualEmail.trim() || !manualResult) return;
    setManualLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ plan: manualPlan, plan_updated_at: new Date().toISOString() })
        .eq("email", manualEmail.trim());
      if (error) throw error;
      toast.success(`${manualResult.name}'s plan updated to ${manualPlan}`);
      setManualOpen(false);
      setManualEmail("");
      setManualResult(null);
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setManualLoading(false);
    }
  };

  const openSlip = async (slipUrl: string) => {
    const path = slipUrl.includes("/payment-slips/")
      ? slipUrl.split("/payment-slips/")[1]
      : slipUrl;
    const { data, error } = await supabase.storage
      .from("payment-slips")
      .createSignedUrl(path, 60);
    if (error || !data?.signedUrl) { toast.error("Could not open slip"); return; }
    window.open(data.signedUrl, "_blank");
  };

  const handleAction = async () => {
    if (!selected || !action) return;
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error: updateError } = await supabase
        .from("bank_transfer_requests")
        .update({
          status: action === "approve" ? "approved" : "rejected",
          notes: adminNotes || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq("id", selected.id);
      if (updateError) throw updateError;

      if (action === "approve") {
        const { error: planError } = await supabase
          .from("profiles")
          .update({ plan: selected.target_plan, plan_updated_at: new Date().toISOString() })
          .eq("id", selected.user_id);
        if (planError) throw planError;
      }

      toast.success(action === "approve" ? "Plan upgraded successfully!" : "Request rejected.");
      setSelected(null);
      setAction(null);
      setAdminNotes("");
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return <span className={`text-xs px-2 py-1 rounded-full font-medium ${map[status]}`}>{status}</span>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bank Transfer Requests</h1>
          <p className="text-muted-foreground text-sm">Review and approve manual payment requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setManualOpen(true)}>
            <UserCog className="h-4 w-4 mr-2" />
            Manual Plan Update
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {(["pending", "approved", "rejected"] as const).map((s) => (
          <Card key={s}>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold">{requests.filter(r => r.status === s).length}</p>
              <p className="text-sm text-muted-foreground capitalize">{s}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
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
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : requests.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No requests yet</TableCell></TableRow>
              ) : requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-mono text-xs">{req.reference_number}</TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{req.profiles?.full_name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{req.profiles?.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{req.target_plan}</Badge>
                  </TableCell>
                  <TableCell>LKR {req.amount.toFixed(2)}</TableCell>
                  <TableCell>{statusBadge(req.status)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(req.submitted_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {req.slip_url && (
                        <Button variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => openSlip(req.slip_url!)}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {req.status === "pending" && (
                        <>
                          <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700"
                            onClick={() => { setSelected(req); setAction("approve"); }}>
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" className="h-7 text-xs"
                            onClick={() => { setSelected(req); setAction("reject"); }}>
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
        </CardContent>
      </Card>

      {/* Approve/Reject Dialog */}
      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setAction(null); setAdminNotes(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action === "approve" ? "Approve Payment" : "Reject Request"}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <p><span className="text-muted-foreground">User:</span> {selected.profiles?.email}</p>
              <p><span className="text-muted-foreground">Reference:</span> <span className="font-mono">{selected.reference_number}</span></p>
              <p><span className="text-muted-foreground">Plan change:</span> current → <strong>{selected.target_plan}</strong></p>
              {action === "approve" && (
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded p-3 text-xs text-green-800 dark:text-green-300">
                  This will immediately update the user's plan to <strong>{selected.target_plan}</strong>.
                </div>
              )}
              <div>
                <Label>Admin Notes (optional)</Label>
                <Textarea placeholder="Add a note for your records..." value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)} className="mt-1 text-sm" rows={3} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={handleAction} disabled={processing}
              className={action === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={action === "reject" ? "destructive" : "default"}>
              {processing ? "Processing..." : action === "approve" ? "Confirm Approve" : "Confirm Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Plan Update Dialog */}
      <Dialog open={manualOpen} onOpenChange={(o) => { setManualOpen(o); setManualEmail(""); setManualResult(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Plan Update</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground text-xs">
              Use this to manually change any user's plan — e.g. after confirming a bank transfer directly.
            </p>

            {/* Email lookup */}
            <div className="space-y-1">
              <Label>User Email</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="user@example.com"
                  value={manualEmail}
                  onChange={(e) => { setManualEmail(e.target.value); setManualResult(null); }}
                  onKeyDown={(e) => e.key === "Enter" && lookupUser()}
                />
                <Button variant="outline" onClick={lookupUser} disabled={manualLoading}>
                  {manualLoading ? "..." : "Lookup"}
                </Button>
              </div>
            </div>

            {/* User preview */}
            {manualResult && (
              <div className="bg-muted rounded p-3 space-y-1">
                <p><span className="text-muted-foreground">Name:</span> {manualResult.name}</p>
                <p>
                  <span className="text-muted-foreground">Current plan:</span>{" "}
                  <Badge variant="outline" className="capitalize ml-1">{manualResult.current_plan}</Badge>
                </p>
              </div>
            )}

            {/* Plan selector */}
            <div className="space-y-1">
              <Label>Set Plan To</Label>
              <Select value={manualPlan} onValueChange={(v) => setManualPlan(v as "free" | "pro")}>
                <SelectTrigger>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setManualOpen(false)}>Cancel</Button>
            <Button
              onClick={handleManualUpdate}
              disabled={manualLoading || !manualResult || manualResult.current_plan === manualPlan}
            >
              {manualLoading ? "Updating..." : `Set to ${manualPlan}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}