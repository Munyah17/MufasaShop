import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { initiatePaynowCheckout } from "@/lib/paynow";
import { logError } from "@/lib/logger";

/**
 * POST /api/payments/paynow
 *
 * Flow:
 *  1. Create an order record in Supabase (status: awaiting_payment)
 *  2. Initiate a Paynow transaction → get hosted checkout URL
 *  3. Return the redirect URL to frontend
 *  4. Frontend opens it in a new tab (Paynow handles all payment)
 *  5. Paynow posts to /api/webhooks/paynow on completion
 *  6. Webhook verifies and updates order status in Supabase
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customer_name, customer_email, customer_phone, shipping_address, notes, shipping_cost, fulfillment_type } = body;

    if (!items?.length || !customer_email || !customer_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const subtotal = items.reduce(
      (sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity,
      0
    );
    const total = subtotal + (shipping_cost ?? 0);

    // 1. Create order in Supabase
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
        payment_method: "paynow",
        payment_status: "pending",
        subtotal,
        shipping_cost: shipping_cost ?? 0,
        total,
      })
      .select()
      .single();

    if (orderError || !order) {
      logError("payments/paynow — order insert", orderError, { customer_email });
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

    // 3. Initiate Paynow hosted checkout (Paynow collects all payment info)
    const result = await initiatePaynowCheckout({
      orderId: order.id,
      reference: `MUFASA-${order.id.slice(0, 8).toUpperCase()}`,
      amount: total,
      email: customer_email,
      description: `MUFASA Order — ${items.length} item(s)`,
      returnUrl: `${appUrl}/orders/${order.id}?status=pending&gateway=paynow`,
      resultUrl: `${appUrl}/api/webhooks/paynow`,
    });

    if (!result.success || !result.redirectUrl) {
      logError("payments/paynow — initiation", result.error, { order_id: order.id });
      await supabase
        .from("orders")
        .update({ status: "failed", payment_status: "failed" })
        .eq("id", order.id);
      return NextResponse.json(
        { error: "Payment gateway unavailable. Please try again or choose Stripe." },
        { status: 502 }
      );
    }

    // 4. Store poll URL for status checking
    if (result.pollUrl) {
      await supabase
        .from("orders")
        .update({ paynow_reference: result.pollUrl })
        .eq("id", order.id);
    }

    // 5. Return redirect URL — frontend opens it in new tab
    return NextResponse.json({ url: result.redirectUrl, orderId: order.id });
  } catch (err: unknown) {
    logError("payments/paynow — checkout", err);
    return NextResponse.json(
      { error: "Payment initiation failed. Please try again or contact support." },
      { status: 500 }
    );
  }
}
