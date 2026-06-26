"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateReferenceNumber } from "@/lib/utils/referenceNumber";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, CheckCircle, Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const BANK_DETAILS = {
  bankName: "HNB",
  accountName: "EDIRISOORIYA E A S A",
  accountNumber: "025020469088",
  branch: "Nittabuwa Branch",
  amount: "LKR 1000.00",
};

export default function BankTransferPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<"details" | "upload" | "done">("details");
  const [copied, setCopied] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [refNumber, setRefNumber] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleProceedToUpload = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setAuthError(true);
      return;
    }
    setAuthError(false);
    const ref = generateReferenceNumber(user.id);
    setRefNumber(ref);
    setStep("upload");
  };

  const handleSubmit = async () => {
    if (!file || !refNumber) {
      toast.error("Please upload your payment slip");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // Upload slip
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/${refNumber}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("payment-slips")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("payment-slips")
        .getPublicUrl(filePath);

      // Insert request
      const { error: dbError } = await supabase
        .from("bank_transfer_requests")
        .insert({
          user_id: user.id,
          reference_number: refNumber,
          amount: 1000.00,
          target_plan: "pro",
          slip_url: publicUrl,
          notes: notes || null,
        });
      if (dbError) throw dbError;

      setStep("done");
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6 space-y-4">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="text-xl font-semibold">Request Submitted!</h2>
            <p className="text-muted-foreground text-sm">
              Your payment proof has been received. We'll verify and upgrade your plan
              within <strong>1–2 business days</strong>.
            </p>
            <Badge variant="outline" className="font-mono text-xs">{refNumber}</Badge>
            <p className="text-xs text-muted-foreground">Keep this reference number for your records.</p>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Bank Transfer Payment</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Upgrade to StudyFlow Pro via direct bank transfer
          </p>
        </div>

        {/* Bank Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Bank Details
              <Badge variant="secondary">Step 1</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(BANK_DETAILS).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </p>
                  <p className="font-medium text-sm">{value}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(value, key)}
                  className="h-8 w-8"
                >
                  {copied === key ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded p-3 flex gap-2 text-xs text-yellow-800 dark:text-yellow-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Transfer exactly <strong>LKR 1000.00</strong>. Include your email in the transfer remarks.</span>
            </div>
          </CardContent>
        </Card>

        {/* Upload Slip */}
        {step === "upload" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Upload Payment Proof
                <Badge variant="secondary">Step 2</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="font-mono text-xs bg-muted rounded px-3 py-2 text-center">
                Reference: <strong>{refNumber}</strong>
              </div>
              <div>
                <Label>Payment Slip (JPG, PNG, or PDF)</Label>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  className="mt-1"
                  onChange={(e) => {
                    const selected = e.target.files?.[0] || null;
                    if (selected && selected.size > 1 * 1024 * 1024) {
                      setFileError("File size must be less than 1 MB.");
                      setFile(null);
                      e.target.value = "";
                    } else {
                      setFileError(null);
                      setFile(selected);
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">Max file size: 1 MB</p>
                {fileError && (
                  <Alert variant="destructive" className="mt-2 py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{fileError}</AlertDescription>
                  </Alert>
                )}
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Input
                  placeholder="e.g. transferred from HNB savings"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleSubmit} disabled={loading || !file} className="w-full">
                {loading ? "Submitting..." : (
                  <><Upload className="h-4 w-4 mr-2" /> Submit Payment Proof</>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "details" && (
          <div className="space-y-3">
            {authError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You're not logged in. Please{" "}
                  <a href="/login" className="underline font-medium">
                    sign in
                  </a>{" "}
                  to proceed with the payment.
                </AlertDescription>
              </Alert>
            )}
            <Button onClick={handleProceedToUpload} className="w-full">
              I've Made the Transfer → Upload Slip
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}