import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * POST /api/webhooks/stripe
 *
 * Stripe calls this endpoint after payment events.
 * We verify the signature, then update the order in Supabase.
 * We never confirm payments ourselves — we only react to Stripe's confirmation.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: import("stripe").Stripe.Event;

  try {
    const { stripe, STRIPE_WEBHOOK_SECRET } = await import("@/lib/stripe");
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err: unknown) {
    console.error("[stripe webhook] signature verification failed:", err);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err instanceof Error ? err.message : ""}` },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as import("stripe").Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;

      if (!orderId) {
        console.error("[stripe webhook] no order_id in session metadata");
        break;
      }

      if (session.payment_status === "paid") {
        const { error } = await supabase
          .from("orders")
          .update({
            status: "paid",
            payment_status: "completed",
            payment_reference: session.payment_intent as string,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);

        if (error) {
          console.error("[stripe webhook] failed to update order:", error);
          return NextResponse.json({ error: "DB update failed" }, { status: 500 });
        }

        console.log(`[stripe webhook] Order ${orderId} marked as PAID`);
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as import("stripe").Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;
      if (orderId) {
        await supabase
          .from("orders")
          .update({ status: "cancelled", payment_status: "cancelled" })
          .eq("id", orderId);
        console.log(`[stripe webhook] Order ${orderId} cancelled (session expired)`);
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object as import("stripe").Stripe.PaymentIntent;
      await supabase
        .from("orders")
        .update({ status: "failed", payment_status: "failed" })
        .eq("stripe_session_id", pi.id);
      console.log(`[stripe webhook] Payment failed for PI ${pi.id}`);
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as import("stripe").Stripe.Charge;
      const pi = charge.payment_intent as string;
      await supabase
        .from("orders")
        .update({ status: "refunded", payment_status: "refunded" })
        .eq("payment_reference", pi);
      console.log(`[stripe webhook] Refund processed for charge ${charge.id}`);
      break;
    }

    default:
      // Unhandled event type — acknowledge receipt
      break;
  }

  return NextResponse.json({ received: true });
}

