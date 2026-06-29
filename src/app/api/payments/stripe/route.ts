import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { logError } from "@/lib/logger";

/**
 * POST /api/payments/stripe
 *
 * 1. Validate request
 * 2. Write order to Supabase (status: awaiting_payment)
 * 3. Create Stripe Checkout Session (hosted — we never see card details)
 * 4. Store session ID on order for webhook reconciliation
 * 5. Return { url } → frontend does window.location.href redirect
 * 6. Stripe calls /api/webhooks/stripe on completion → updates order status
 */
export async function POST(req: NextRequest) {
  // Derive origin from env or request headers — works on Vercel even if env not set
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    `${req.headers.get("x-forwarded-proto") ?? "https"}://${req.headers.get("host")}`;

  let orderId: string | null = null;

  try {
    const body = await req.json();
    const {
      items,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      notes,
      shipping_cost,
      fulfillment_type,
    } = body as {
      items: { product_id: string; name: string; price: number; quantity: number }[];
      customer_name: string;
      customer_email: string;
      customer_phone?: string;
      shipping_address?: Record<string, string>;
      notes?: string;
      shipping_cost?: number;
      fulfillment_type?: string;
    };

    if (!items?.length || !customer_email || !customer_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const deliveryFee = shipping_cost ?? 0;
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const total = subtotal + deliveryFee;

    const supabase = createAdminClient();

    // 1. Create order record
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_email,
        customer_name,
        customer_phone: customer_phone ?? null,
        shipping_address: shipping_address ?? null,
        notes: notes ?? null,
        fulfillment_type: fulfillment_type ?? "delivery",
        status: "awaiting_payment",
        payment_method: "stripe",
        payment_status: "pending",
        subtotal,
        shipping_cost: deliveryFee,
        total,
      })
      .select()
      .single();

    if (orderError || !order) {
      logError("stripe/order-insert", orderError, { customer_email });
      return NextResponse.json(
        { error: "Unable to create your order. Please try again." },
        { status: 500 }
      );
    }

    orderId = order.id;

    // 2. Write order items (non-fatal — can be reconciled from Stripe metadata)
    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }))
    );
    if (itemsError) logError("stripe/order-items-insert", itemsError, { order_id: order.id });

    // 3. Build Stripe line items
    //    Delivery fee is a regular line item — avoids shipping_rate_data account-permission issues
    const lineItems = [
      ...items.map((item) => ({
        price_data: {
          currency: "usd" as const,
          unit_amount: Math.round(item.price * 100),
          product_data: { name: item.name },
        },
        quantity: item.quantity,
      })),
      ...(deliveryFee > 0
        ? [
            {
              price_data: {
                currency: "usd" as const,
                unit_amount: Math.round(deliveryFee * 100),
                product_data: { name: "Delivery to Zimbabwe" },
              },
              quantity: 1 as const,
            },
          ]
        : []),
    ];

    // 4. Create Stripe Checkout Session
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email,
      line_items: lineItems,
      billing_address_collection: "auto",
      success_url: `${appUrl}/orders/${order.id}?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout?status=cancelled`,
      metadata: {
        order_id: order.id,
        fulfillment_type: fulfillment_type ?? "delivery",
      },
    });

    if (!session.url) {
      logError("stripe/no-session-url", new Error("Session created but url is null"), {
        order_id: order.id,
        session_id: session.id,
      });
      return NextResponse.json(
        { error: "Payment session could not be opened. Please try again." },
        { status: 500 }
      );
    }

    // 5. Store session ID for webhook reconciliation
    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return NextResponse.json({ url: session.url, orderId: order.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logError("stripe/checkout-fatal", err, { stripe_error: message, order_id: orderId, app_url: appUrl });
    return NextResponse.json(
      { error: "Payment initiation failed. Please try again or contact support." },
      { status: 500 }
    );
  }
}
