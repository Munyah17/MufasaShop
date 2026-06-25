"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, CreditCard, Smartphone, CheckCircle } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { Button } from "@/components/ui/Button";
import type { CheckoutFormData, PaymentMethod } from "@/types";

const STRIPE_METHODS = [
  "Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay", "Link",
];
const PAYNOW_METHODS = [
  "EcoCash", "OneMoney", "Telecash", "Visa (ZWL)", "Mastercard (ZWL)",
];

export default function CheckoutPage() {
  const { items, total, itemCount, clearCart } = useCartStore();
  const cartTotal = total();
  const count = itemCount();
  const shipping = cartTotal >= 150 ? 0 : 15;
  const orderTotal = cartTotal + shipping;

  const [form, setForm] = useState<CheckoutFormData>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_address: { line1: "", city: "", country: "Zimbabwe" },
    notes: "",
    payment_method: "stripe",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4 text-center px-4">
        <span className="text-5xl">🛒</span>
        <h2 className="font-display text-2xl text-obsidian-200">Your cart is empty</h2>
        <Link href="/products">
          <Button variant="gold">Browse Products</Button>
        </Link>
      </div>
    );
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    if (name.startsWith("addr_")) {
      setForm((f) => ({
        ...f,
        shipping_address: {
          ...f.shipping_address,
          [name.slice(5)]: value,
        },
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  async function handleCheckout() {
    setError("");
    if (!form.customer_name || !form.customer_email || !form.shipping_address.line1 || !form.shipping_address.city) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);

    try {
      const endpoint =
        form.payment_method === "stripe"
          ? "/api/payments/stripe"
          : "/api/payments/paynow";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id: i.product_id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          })),
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          customer_phone: form.customer_phone,
          shipping_address: form.shipping_address,
          notes: form.notes,
          shipping_cost: shipping,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Failed to initiate payment.");
      }

      /* ── Payment gateway does all the work ──────────────────────────
         We open the hosted checkout URL in a new tab.
         The gateway handles card/mobile money collection, fraud checks,
         and confirmation. We never touch payment data.
         Webhooks (/api/webhooks/stripe or /api/webhooks/paynow) will
         update the order status when the gateway confirms payment.
      ─────────────────────────────────────────────────────────────── */
      clearCart();
      window.open(data.url, "_blank", "noopener,noreferrer");

      // Redirect user to the pending order page
      window.location.href = `/orders/${data.orderId}?status=pending`;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/cart" className="text-obsidian-400 hover:text-gold-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display font-bold text-3xl text-obsidian-50">Checkout</h1>
            <p className="text-obsidian-500 text-sm">{count} items · ${orderTotal.toFixed(2)}</p>
          </div>
        </div>

        {/* Security notice */}
        <div className="flex items-center gap-3 px-4 py-3 mb-8 bg-obsidian-800/60 border border-gold-500/20 rounded-xl">
          <ShieldCheck size={18} className="text-gold-500 shrink-0" />
          <p className="text-obsidian-300 text-sm">
            Your payment is processed entirely by our certified payment partners. We never
            see or store your card or mobile money details.
          </p>
          <Lock size={14} className="text-obsidian-500 shrink-0 ml-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — Form */}
          <div className="lg:col-span-3 space-y-8">
            {/* Contact */}
            <Section title="Contact Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Full Name *"
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                />
                <Field
                  label="Email Address *"
                  name="customer_email"
                  type="email"
                  value={form.customer_email}
                  onChange={handleChange}
                  placeholder="john@email.com"
                />
                <Field
                  label="Phone Number"
                  name="customer_phone"
                  type="tel"
                  value={form.customer_phone}
                  onChange={handleChange}
                  placeholder="+263 77 123 4567"
                  className="sm:col-span-2"
                />
              </div>
            </Section>

            {/* Shipping Address */}
            <Section title="Shipping Address">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Address Line 1 *"
                  name="addr_line1"
                  value={form.shipping_address.line1}
                  onChange={handleChange}
                  placeholder="123 Main Street"
                  className="sm:col-span-2"
                />
                <Field
                  label="Address Line 2"
                  name="addr_line2"
                  value={form.shipping_address.line2 ?? ""}
                  onChange={handleChange}
                  placeholder="Apartment, suite, etc."
                  className="sm:col-span-2"
                />
                <Field
                  label="City *"
                  name="addr_city"
                  value={form.shipping_address.city}
                  onChange={handleChange}
                  placeholder="Harare"
                />
                <div>
                  <label className="block text-obsidian-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
                    Country *
                  </label>
                  <select
                    name="addr_country"
                    value={form.shipping_address.country}
                    onChange={handleChange}
                    className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-4 py-3 text-obsidian-100 text-sm focus:outline-none focus:border-gold-500 transition-colors"
                  >
                    <option value="Zimbabwe">Zimbabwe</option>
                    <option value="Zambia">Zambia</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Botswana">Botswana</option>
                    <option value="Mozambique">Mozambique</option>
                  </select>
                </div>
              </div>
            </Section>

            {/* Notes */}
            <Section title="Order Notes (Optional)">
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Special delivery instructions, gate codes, etc."
                rows={3}
                className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-4 py-3 text-obsidian-100 text-sm placeholder:text-obsidian-600 focus:outline-none focus:border-gold-500 transition-colors resize-none"
              />
            </Section>

            {/* ── Payment Method Selection ───────────────────────────── */}
            <Section title="Payment Method">
              <p className="text-obsidian-500 text-xs mb-4">
                Select a payment gateway. You will be securely redirected to complete
                payment — we never collect your payment details.
              </p>

              <div className="space-y-4">
                {/* Stripe Option */}
                <PaymentOption
                  id="stripe"
                  selected={form.payment_method === "stripe"}
                  onSelect={() => setForm((f) => ({ ...f, payment_method: "stripe" }))}
                  label="Pay with Stripe"
                  subtitle="International cards & digital wallets"
                  icon={<CreditCard size={20} className="text-[#635BFF]" />}
                  bannerSrc="/payment-banners/stripe-banner.png"
                  bannerAlt="Stripe — Visa, Mastercard, Amex, Apple Pay, Google Pay"
                  methods={STRIPE_METHODS}
                  methodsLabel="Accepted:"
                  accentColor="border-[#635BFF]/40 bg-[#635BFF]/5"
                  tagline="Powered by Stripe — PCI DSS Level 1 Certified"
                />

                {/* Paynow Option */}
                <PaymentOption
                  id="paynow"
                  selected={form.payment_method === "paynow"}
                  onSelect={() => setForm((f) => ({ ...f, payment_method: "paynow" }))}
                  label="Pay with Paynow Zimbabwe"
                  subtitle="Mobile money & local cards (ZWL / USD)"
                  icon={<Smartphone size={20} className="text-[#E31837]" />}
                  bannerSrc="/payment-banners/paynow-banner.png"
                  bannerAlt="Paynow — EcoCash, OneMoney, Telecash, Visa, Mastercard"
                  methods={PAYNOW_METHODS}
                  methodsLabel="Accepted:"
                  accentColor="border-[#E31837]/40 bg-[#E31837]/5"
                  tagline="Zimbabwe's trusted payment gateway"
                />
              </div>
            </Section>

            {error && (
              <div className="p-4 bg-red-900/30 border border-red-600/50 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Right — Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-obsidian-800 border border-obsidian-700 rounded-xl p-6 sticky top-24 space-y-5">
              <h2 className="font-display font-semibold text-obsidian-100 pb-4 border-b border-obsidian-700">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product_id} className="flex gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-obsidian-700 shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold-500 text-obsidian-900 rounded-full text-[9px] font-bold flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-obsidian-200 text-xs leading-snug line-clamp-2">{item.name}</p>
                      <p className="text-gold-500 text-xs font-bold mt-0.5">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-obsidian-700 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-obsidian-400">Subtotal</span>
                  <span className="text-obsidian-100">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-obsidian-400">Shipping</span>
                  <span className={shipping === 0 ? "text-green-400" : "text-obsidian-100"}>
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-obsidian-700 pt-4">
                <div className="flex justify-between items-baseline mb-6">
                  <span className="text-obsidian-100 font-semibold">Total</span>
                  <span className="text-gold-500 font-bold text-2xl">
                    ${orderTotal.toFixed(2)}
                  </span>
                </div>

                <Button
                  variant="gold"
                  fullWidth
                  size="lg"
                  loading={loading}
                  onClick={handleCheckout}
                  className="text-base font-bold"
                >
                  <Lock size={16} />
                  {loading
                    ? "Redirecting to Payment…"
                    : `Pay via ${form.payment_method === "stripe" ? "Stripe" : "Paynow"}`}
                </Button>

                <p className="text-obsidian-600 text-[11px] text-center mt-3 leading-relaxed">
                  By proceeding you agree to our{" "}
                  <Link href="/legal/terms" className="text-obsidian-400 hover:text-gold-500">
                    Terms of Service
                  </Link>
                  . Payment processed by {form.payment_method === "stripe" ? "Stripe, Inc." : "Paynow Zimbabwe"}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helper components ─────────────────────────────────────────────── */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-obsidian-800 border border-obsidian-700 rounded-xl p-6">
      <h2 className="font-display font-semibold text-obsidian-100 text-base mb-5 pb-4 border-b border-obsidian-700">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-obsidian-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-obsidian-900 border border-obsidian-600 rounded-lg px-4 py-3 text-obsidian-100 text-sm placeholder:text-obsidian-600 focus:outline-none focus:border-gold-500 transition-colors"
      />
    </div>
  );
}

function PaymentOption({
  id,
  selected,
  onSelect,
  label,
  subtitle,
  icon,
  bannerSrc,
  bannerAlt,
  methods,
  methodsLabel,
  accentColor,
  tagline,
}: {
  id: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  bannerSrc: string;
  bannerAlt: string;
  methods: string[];
  methodsLabel: string;
  accentColor: string;
  tagline: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-200 ${
        selected
          ? `${accentColor} border-current shadow-sm`
          : "border-obsidian-700 bg-obsidian-900 hover:border-obsidian-500"
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        {/* Radio */}
        <div
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
            selected ? "border-gold-500 bg-gold-500" : "border-obsidian-600"
          }`}
        >
          {selected && <CheckCircle size={12} className="text-obsidian-900" />}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            {icon}
            <span className="text-obsidian-100 font-semibold text-sm">{label}</span>
          </div>
          <p className="text-obsidian-500 text-xs">{subtitle}</p>
        </div>
      </div>

      {/* Payment gateway banner — you upload your own images to /public/payment-banners/ */}
      <div className="relative w-full h-16 rounded-lg overflow-hidden bg-obsidian-800 border border-obsidian-700 mb-3">
        <Image
          src={bannerSrc}
          alt={bannerAlt}
          fill
          className="object-contain p-2"
          onError={() => {}}
        />
        {/* Fallback when image not yet uploaded */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 flex-wrap px-3">
          {methods.map((m) => (
            <span
              key={m}
              className="px-2 py-0.5 bg-obsidian-700 border border-obsidian-600 rounded text-[10px] text-obsidian-300 font-medium"
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      <p className="text-obsidian-600 text-[11px] flex items-center gap-1">
        <Lock size={10} /> {tagline}
      </p>
    </button>
  );
}
