import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { logError } from "@/lib/logger";

/**
 * POST /api/payments/stripe
 *
 * Flow:
 *  1. Create an order record in Supabase (status: awaiting_payment)
 *  2. Create a Stripe Checkout Session (hosted — we never touch card data)
 *  3. Return the session URL to the frontend
 *  4. Frontend opens it in a new tab
 *  5. Stripe handles all payment processing and confirmation
 *  6. Stripe calls /api/webhooks/stripe on completion
 *  7. Webhook updates the order status in Supabase
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customer_name, customer_email, customer_phone, shipping_address, notes, shipping_cost, fulfillment_type } = body;

    if (!items?.length || !customer_email || !customer_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Lazy-import stripe so missing key only errors at call time (not build time)
    const { stripe } = await import("@/lib/stripe");
    const supabase = createAdminClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const subtotal = items.reduce(
      (sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity,
      0
    );
    const total = subtotal + (shipping_cost ?? 0);

    // 1. Create the order in Supabase
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_email,
        customer_name,
        customer_phone: customer_phone ?? null,
        shipping_address,
        notes: notes ?? null,
        fulfillment_type: fulfillment_type ?? "delivery",
        status: "awaiting_payment",
        payment_method: "stripe",
        payment_status: "pending",
        subtotal,
        shipping_cost: shipping_cost ?? 0,
        total,
      })
      .select()
      .single();

    if (orderError || !order) {
      logError("payments/stripe — order insert", orderError, { customer_email });
      return NextResponse.json({ error: "Unable to process your order. Please try again." }, { status: 500 });
    }

    // 2. Insert order items
    await supabase.from("order_items").insert(
      items.map((item: {
        product_id: string;
        name: string;
        image?: string;
        price: number;
        quantity: number;
      }) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.name,
        product_image: item.image ?? null,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }))
    );

    // 3. Create Stripe Checkout Session (hosted — Stripe collects payment)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email,
      line_items: items.map((item: {
        name: string;
        image?: string;
        price: number;
        quantity: number;
      }) => ({
        price_data: {
          currency: "usd",
          unit_amount: Math.round(item.price * 100),
          product_data: {
            name: item.name,
            // Stripe requires public HTTPS images — omit to avoid storage URL failures
          },
        },
        quantity: item.quantity,
      })),
      ...(shipping_cost > 0
        ? {
            shipping_options: [
              {
                shipping_rate_data: {
                  type: "fixed_amount",
                  fixed_amount: { amount: Math.round(shipping_cost * 100), currency: "usd" },
                  display_name: "Standard Delivery",
                },
              },
            ],
          }
        : {}),
      success_url: `${appUrl}/orders/${order.id}?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout?status=cancelled`,
      metadata: {
        order_id: order.id,
      },
    });

    // 4. Store the stripe session id on the order
    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    // 5. Return hosted checkout URL — frontend opens this in a new tab
    return NextResponse.json({ url: session.url, orderId: order.id });
  } catch (err: unknown) {
    logError("payments/stripe — checkout", err);
    return NextResponse.json(
      { error: "Payment initiation failed. Please try again or contact support." },
      { status: 500 }
    );
  }
}
