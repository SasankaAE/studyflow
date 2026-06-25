"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";

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
  const [selected, setSelected] = useState<TransferRequest | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("bank_transfer_requests")
      .select(`*, profiles(email, full_name)`)
      .order("submitted_at", { ascending: false });
    if (error) toast.error(error.message);
    else setRequests(data as TransferRequest[]);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async () => {
    if (!selected || !action) return;
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Update request status
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

      // If approved, update user plan
      if (action === "approve") {
        const newPlan = selected.target_plan; // 'pro' or 'free'
        const { error: planError } = await supabase
          .from("profiles")
          .update({
            plan: newPlan,
            plan_updated_at: new Date().toISOString(),
          })
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
    const map = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    } as Record<string, string>;
    return <span className={`text-xs px-2 py-1 rounded-full font-medium ${map[status]}`}>{status}</span>;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bank Transfer Requests</h1>
        <p className="text-muted-foreground text-sm">Review and approve manual payment requests</p>
      </div>

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
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                          <a href={req.slip_url} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      )}
                      {req.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-green-600 hover:bg-green-700"
                            onClick={() => { setSelected(req); setAction("approve"); }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 text-xs"
                            onClick={() => { setSelected(req); setAction("reject"); }}
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
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setAction(null); setAdminNotes(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve Payment" : "Reject Request"}
            </DialogTitle>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button
              onClick={handleAction}
              disabled={processing}
              className={action === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={action === "reject" ? "destructive" : "default"}
            >
              {processing ? "Processing..." : action === "approve" ? "Confirm Approve" : "Confirm Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}