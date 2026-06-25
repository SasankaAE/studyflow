"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function approveTransfer(
  transferId: string,
  userId: string,
  targetPlan: string,
  adminNotes: string | null,
  action: "approve" | "reject"
) {
  const newStatus = action === "approve" ? "approved" : "rejected";

  const { error: e1 } = await supabaseAdmin
    .from("bank_transfer_requests")
    .update({
      status: newStatus,
      notes: adminNotes,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", transferId);

  if (e1) throw new Error(`Transfer update failed: ${e1.message}`);

  if (action === "approve") {
    const { error: e2 } = await supabaseAdmin
      .from("profiles")
      .update({ plan: targetPlan, plan_updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (e2) throw new Error(`Profile update failed: ${e2.message}`);
  }

  return { success: true };
}