import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyPaynowHash } from "@/lib/paynow";
import { logError } from "@/lib/logger";

/**
 * POST /api/webhooks/paynow  (resultUrl)
 *
 * Paynow posts a URL-encoded form body to this endpoint after each
 * payment status change. We verify the hash, then update the order.
 * We never confirm payments ourselves — we only react to Paynow's data.
 *
 * Paynow status values:
 *   Paid        — payment successful
 *   Cancelled   — user cancelled
 *   Failed      — payment failed
 *   Awaiting Delivery — paid, waiting for delivery confirmation
 *   Delivered   — delivery confirmed (for on-delivery)
 */
export async function POST(req: NextRequest) {
  const body = await req.text();

  const params: Record<string, string> = Object.fromEntries(
    body.split("&").map((pair) => {
      const [k, v] = pair.split("=");
      return [decodeURIComponent(k ?? ""), decodeURIComponent(v ?? "")];
    })
  );

  const integrationKey = process.env.PAYNOW_INTEGRATION_KEY!;

  if (!verifyPaynowHash(params, integrationKey)) {
    logError("webhooks/paynow — hash verification failed", new Error("Invalid hash"), { reference: params.reference });
    return NextResponse.json({ error: "Invalid hash" }, { status: 400 });
  }

  const { status, reference, amount, pollurl } = params;
  const supabase = createAdminClient();

  const statusLower = status?.toLowerCase();

  const statusMap: Record<string, { status: string; payment_status: string }> = {
    paid: { status: "paid", payment_status: "completed" },
    "awaiting delivery": { status: "paid", payment_status: "completed" },
    delivered: { status: "delivered", payment_status: "completed" },
    cancelled: { status: "cancelled", payment_status: "cancelled" },
    failed: { status: "failed", payment_status: "failed" },
    refunded: { status: "refunded", payment_status: "refunded" },
  };

  const mapped = statusMap[statusLower];

  if (!mapped) {
    console.log(`[paynow webhook] unhandled status: ${status}`);
    return NextResponse.json({ received: true });
  }

  // Find the order by the Paynow poll URL stored at initiation
  const { data: order, error: findError } = await supabase
    .from("orders")
    .select("id")
    .eq("paynow_reference", pollurl)
    .single();

  if (findError || !order) {
    const { data: orderByRef } = await supabase
      .from("orders")
      .select("id")
      .eq("payment_reference", reference)
      .maybeSingle();

    if (!orderByRef) {
      logError("webhooks/paynow — order not found", new Error("No matching order"), { pollurl, reference });
      return NextResponse.json({ received: true });
    }

    await supabase.from("orders").update({
      ...mapped,
      payment_reference: reference,
      updated_at: new Date().toISOString(),
    }).eq("id", orderByRef.id);

    console.log(`[paynow webhook] Order ${orderByRef.id} → ${mapped.status} (by reference)`);
    return NextResponse.json({ received: true });
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      ...mapped,
      payment_reference: reference,
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (updateError) {
    logError("webhooks/paynow — order update", updateError, { order_id: order.id });
    return NextResponse.json({ error: "DB update failed" }, { status: 500 });
  }

  console.log(`[paynow webhook] Order ${order.id} → ${mapped.status} | Amount: ${amount}`);
  return NextResponse.json({ received: true });
}
