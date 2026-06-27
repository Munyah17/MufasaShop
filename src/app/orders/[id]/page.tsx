"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { CheckCircle, Clock, XCircle, Package, ArrowRight, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { Order } from "@/types";

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/30",
    title: "Payment Pending",
    message:
      "Your order has been created. Complete the payment in the tab that just opened. This page will update automatically once Paynow or Stripe confirms your payment.",
  },
  awaiting_payment: {
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/30",
    title: "Awaiting Payment",
    message: "Please complete your payment in the payment gateway tab. This page refreshes every 10 seconds.",
  },
  paid: {
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/30",
    title: "Payment Confirmed!",
    message: "Your payment has been confirmed by our payment partner. We are now processing your order.",
  },
  processing: {
    icon: Package,
    color: "text-gold-500",
    bg: "bg-gold-500/10 border-gold-500/30",
    title: "Order Processing",
    message: "Your payment was successful! We are preparing your order for dispatch.",
  },
  shipped: {
    icon: Package,
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/30",
    title: "Order Shipped",
    message: "Your order is on its way! Expect delivery soon.",
  },
  delivered: {
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/30",
    title: "Order Delivered",
    message: "Your order has been delivered. Enjoy your premium MUFASA tech!",
  },
  cancelled: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/30",
    title: "Order Cancelled",
    message: "This order was cancelled. No payment was taken. You can shop again anytime.",
  },
  failed: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/30",
    title: "Payment Failed",
    message: "The payment could not be processed. Please try again or choose a different payment method.",
  },
  refunded: {
    icon: RefreshCw,
    color: "text-obsidian-300",
    bg: "bg-obsidian-700/50 border-obsidian-600",
    title: "Refund Processed",
    message: "A refund has been issued for this order. Please allow 3-5 business days for it to appear.",
  },
};

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const urlStatus = searchParams.get("status");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  async function fetchOrder() {
    const supabase = createClient();
    const { data } = await supabase
      .from("shop_orders")
      .select("*, items:shop_order_items(*)")
      .eq("id", id)
      .single();
    setOrder(data as Order | null);
    setLoading(false);
    setLastRefresh(Date.now());
  }

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Auto-refresh every 10s while awaiting payment
  useEffect(() => {
    const status = order?.status ?? urlStatus;
    const shouldPoll =
      status === "awaiting_payment" || status === "pending";
    if (!shouldPoll) return;

    const interval = setInterval(fetchOrder, 10_000);
    return () => clearInterval(interval);
  }, [order?.status, urlStatus]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4 text-center px-4">
        <span className="text-5xl">📦</span>
        <h2 className="font-display text-2xl text-obsidian-200">Order not found</h2>
        <p className="text-obsidian-500 text-sm max-w-sm">
          Order ID: <code className="text-gold-500">{id}</code>
        </p>
        <Link href="/products">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const config =
    STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
  const { icon: StatusIcon } = config;

  const isPending = order.status === "awaiting_payment" || order.status === "pending";
  const isPaid = ["paid", "processing", "shipped", "delivered"].includes(order.status);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Status card */}
        <div className={`rounded-2xl border p-6 mb-8 ${config.bg}`}>
          <div className="flex items-start gap-4">
            <div className={`${config.color} shrink-0 mt-0.5`}>
              <StatusIcon size={32} />
            </div>
            <div>
              <h1 className={`font-display font-bold text-2xl ${config.color} mb-1`}>
                {config.title}
              </h1>
              <p className="text-obsidian-300 text-sm leading-relaxed">{config.message}</p>
              {isPending && (
                <div className="flex items-center gap-2 mt-3 text-obsidian-400 text-xs">
                  <RefreshCw size={12} className="animate-spin" />
                  Auto-refreshing every 10 seconds…
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order info */}
        <div className="bg-obsidian-800 border border-obsidian-700 rounded-xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-obsidian-700">
            <h2 className="font-display font-semibold text-obsidian-100">Order Details</h2>
          </div>

          <div className="px-6 py-4 space-y-3 text-sm">
            <Row label="Order ID" value={<code className="text-gold-500 text-xs">{order.id}</code>} />
            <Row label="Customer" value={order.customer_name} />
            <Row label="Email" value={order.customer_email} />
            <Row
              label="Payment"
              value={
                <span className="capitalize">
                  {order.payment_method ?? "—"}
                  {order.payment_reference && (
                    <span className="text-obsidian-500 ml-2 text-xs">
                      ref: {order.payment_reference.slice(0, 16)}…
                    </span>
                  )}
                </span>
              }
            />
            <Row
              label="Status"
              value={
                <span className={`font-semibold capitalize ${config.color}`}>
                  {order.status.replace(/_/g, " ")}
                </span>
              }
            />
            <Row
              label="Date"
              value={new Date(order.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
          </div>
        </div>

        {/* Items */}
        {order.items && order.items.length > 0 && (
          <div className="bg-obsidian-800 border border-obsidian-700 rounded-xl overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-obsidian-700">
              <h2 className="font-display font-semibold text-obsidian-100">Items Ordered</h2>
            </div>
            <div className="divide-y divide-obsidian-700">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                  {item.product_image && (
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-obsidian-700 shrink-0">
                      <Image
                        src={item.product_image}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-obsidian-100 text-sm font-medium truncate">
                      {item.product_name}
                    </p>
                    <p className="text-obsidian-500 text-xs">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-gold-500 font-bold text-sm">
                    ${item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-obsidian-700 space-y-2 text-sm">
              <div className="flex justify-between text-obsidian-400">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-obsidian-400">
                <span>Shipping</span>
                <span>
                  {order.shipping_cost === 0 ? "Free" : `$${order.shipping_cost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-obsidian-100 font-bold text-base pt-2 border-t border-obsidian-700">
                <span>Total</span>
                <span className="text-gold-500">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {isPaid ? (
            <Link href="/products" className="flex-1">
              <Button variant="gold" fullWidth>
                Continue Shopping <ArrowRight size={16} />
              </Button>
            </Link>
          ) : order.status === "failed" || order.status === "cancelled" ? (
            <Link href="/checkout" className="flex-1">
              <Button variant="gold" fullWidth>
                Try Again <ArrowRight size={16} />
              </Button>
            </Link>
          ) : (
            <Button variant="outline" fullWidth onClick={fetchOrder}>
              <RefreshCw size={14} /> Refresh Status
            </Button>
          )}
          <Link href="/products">
            <Button variant="ghost" size="md">
              Browse More
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-obsidian-500 shrink-0 w-24">{label}</span>
      <span className="text-obsidian-200 text-right">{value}</span>
    </div>
  );
}
