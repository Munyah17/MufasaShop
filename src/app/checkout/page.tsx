"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, ShieldCheck, Lock, CreditCard, Smartphone,
  CheckCircle, Truck, Store, MapPin, Clock,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { Button } from "@/components/ui/Button";
import {
  DELIVERY_CITIES, COLLECTION_POINT, getZonesForCity, getDeliveryFee,
} from "@/lib/delivery";
import type { PaymentMethod } from "@/types";

const STRIPE_METHODS = ["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay", "Link"];
const PAYNOW_METHODS = ["EcoCash", "OneMoney", "InnBucks", "Visa", "Mastercard"];

type DeliveryMethod = "delivery" | "collection";

interface FormState {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  addr_line1: string;
  addr_suburb: string;
  notes: string;
  payment_method: PaymentMethod;
}

export default function CheckoutPage() {
  const { items, total, itemCount, clearCart } = useCartStore();
  const cartTotal = total();
  const count = itemCount();

  const [form, setForm] = useState<FormState>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    addr_line1: "",
    addr_suburb: "",
    notes: "",
    payment_method: "stripe",
  });
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("delivery");
  const [deliveryCity, setDeliveryCity] = useState("Harare");
  const [deliveryZone, setDeliveryZone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const zones = useMemo(() => getZonesForCity(deliveryCity), [deliveryCity]);

  const shippingFee = useMemo(() => {
    if (deliveryMethod === "collection") return 0;
    return getDeliveryFee(deliveryCity, deliveryZone);
  }, [deliveryMethod, deliveryCity, deliveryZone]);

  const orderTotal = cartTotal + shippingFee;

  const selectedZone = zones.find((z) => z.id === deliveryZone);

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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleCityChange(city: string) {
    setDeliveryCity(city);
    setDeliveryZone(""); // reset zone when city changes
  }

  async function handleCheckout() {
    setError("");

    if (!form.customer_name || !form.customer_email) {
      setError("Full name and email are required.");
      return;
    }

    if (deliveryMethod === "delivery") {
      if (!deliveryCity || !deliveryZone) {
        setError("Please select your delivery city and zone.");
        return;
      }
      if (!form.addr_line1) {
        setError("Please enter your street address.");
        return;
      }
    }

    setLoading(true);

    const endpoint =
      form.payment_method === "stripe" ? "/api/payments/stripe" : "/api/payments/paynow";

    try {
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
          customer_phone: form.customer_phone || null,
          shipping_address:
            deliveryMethod === "delivery"
              ? {
                  line1: form.addr_line1,
                  line2: form.addr_suburb || undefined,
                  city: deliveryCity,
                  state: selectedZone?.name,
                  country: "Zimbabwe",
                }
              : null,
          notes:
            deliveryMethod === "collection"
              ? `SELF COLLECTION. ${form.notes || ""}`.trim()
              : form.notes || null,
          shipping_cost: shippingFee,
          fulfillment_type: deliveryMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Failed to initiate payment.");
      }

      // Full browser redirect — gateway redirects back to /orders/{id} on success
      window.location.href = data.url;
    } catch (err: unknown) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Something went wrong.");
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
            <p className="text-obsidian-500 text-sm">{count} item{count !== 1 ? "s" : ""} · ${orderTotal.toFixed(2)}</p>
          </div>
        </div>

        {/* Security notice */}
        <div className="flex items-center gap-3 px-4 py-3 mb-8 bg-obsidian-800/60 border border-gold-500/20 rounded-xl">
          <ShieldCheck size={18} className="text-gold-500 shrink-0" />
          <p className="text-obsidian-300 text-sm">
            Payment is handled entirely by Stripe or Paynow. We never see or store your card
            or mobile money details. All transactions are settled in <strong className="text-obsidian-100">USD</strong>.
          </p>
          <Lock size={14} className="text-obsidian-500 shrink-0 ml-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ── LEFT: Form ── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Contact */}
            <Section title="Contact Information">
              <p className="text-obsidian-500 text-xs mb-4">
                Buying as a gift from abroad? Enter your own details — we&apos;ll ship to the Zimbabwe address below.
              </p>
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
                  placeholder="you@email.com"
                />
                <Field
                  label="Phone Number"
                  name="customer_phone"
                  type="tel"
                  value={form.customer_phone}
                  onChange={handleChange}
                  placeholder="+263 77 390 9307"
                  className="sm:col-span-2"
                />
              </div>
            </Section>

            {/* Delivery Method */}
            <Section title="Delivery Method">
              <div className="grid grid-cols-2 gap-3 mb-5">
                <MethodCard
                  active={deliveryMethod === "delivery"}
                  onClick={() => setDeliveryMethod("delivery")}
                  icon={<Truck size={20} />}
                  label="Delivery"
                  sub="Delivered in Zimbabwe"
                />
                <MethodCard
                  active={deliveryMethod === "collection"}
                  onClick={() => setDeliveryMethod("collection")}
                  icon={<Store size={20} />}
                  label="Self Collection"
                  sub="Pick up — no shipping fee"
                />
              </div>

              {deliveryMethod === "delivery" ? (
                <div className="space-y-4">
                  {/* City */}
                  <div>
                    <label className={labelCls}>City *</label>
                    <select
                      value={deliveryCity}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className={inputCls}
                    >
                      {DELIVERY_CITIES.map((c) => (
                        <option key={c.city} value={c.city}>{c.city}</option>
                      ))}
                    </select>
                  </div>

                  {/* Zone */}
                  <div>
                    <label className={labelCls}>Area / Zone *</label>
                    <select
                      value={deliveryZone}
                      onChange={(e) => setDeliveryZone(e.target.value)}
                      className={inputCls}
                    >
                      <option value="">— Select your area —</option>
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name} — ${z.fee.toFixed(2)}
                        </option>
                      ))}
                    </select>
                    {selectedZone && (
                      <p className="text-obsidian-500 text-xs mt-1">
                        Areas: {selectedZone.areas.slice(0, 6).join(", ")}
                        {selectedZone.areas.length > 6 ? ` +${selectedZone.areas.length - 6} more` : ""}
                      </p>
                    )}
                  </div>

                  {/* Street address */}
                  <Field
                    label="Street Address *"
                    name="addr_line1"
                    value={form.addr_line1}
                    onChange={handleChange}
                    placeholder="123 Main Street"
                  />
                  <Field
                    label="Suburb / Flat / Unit"
                    name="addr_suburb"
                    value={form.addr_suburb}
                    onChange={handleChange}
                    placeholder="e.g. Borrowdale, Flat 4B"
                  />

                  {deliveryZone && (
                    <div className="flex items-center justify-between px-4 py-3 bg-gold-500/10 border border-gold-500/25 rounded-xl">
                      <div className="flex items-center gap-2 text-gold-400">
                        <Truck size={15} />
                        <span className="text-sm font-medium">Delivery to {deliveryCity}</span>
                      </div>
                      <span className="text-gold-400 font-bold font-mono">
                        ${shippingFee.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-obsidian-900 border border-obsidian-700 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-start gap-3">
                    <MapPin size={15} className="text-gold-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-obsidian-100 text-sm font-semibold">{COLLECTION_POINT.name}</p>
                      <p className="text-obsidian-400 text-xs">{COLLECTION_POINT.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={15} className="text-gold-500 shrink-0" />
                    <p className="text-obsidian-400 text-xs">{COLLECTION_POINT.hours}</p>
                  </div>
                  <p className="text-obsidian-500 text-xs pl-6">{COLLECTION_POINT.note}</p>
                  <div className="pl-6">
                    <span className="text-xs font-mono font-bold text-green-400">FREE — No shipping charge</span>
                  </div>
                </div>
              )}
            </Section>

            {/* Notes */}
            <Section title="Order Notes (Optional)">
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Special delivery instructions, gate codes, recipient name if gifting, etc."
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </Section>

            {/* Payment Method */}
            <Section title="Payment Method">
              <p className="text-obsidian-500 text-xs mb-4">
                All payments are settled in <strong className="text-obsidian-300">USD</strong>.
                Your browser will be redirected to the payment gateway — we never collect
                your payment details.
              </p>

              <div className="space-y-4">
                <PaymentOption
                  id="stripe"
                  selected={form.payment_method === "stripe"}
                  onSelect={() => setForm((f) => ({ ...f, payment_method: "stripe" }))}
                  label="Pay with Stripe"
                  subtitle="International cards & digital wallets · USD"
                  icon={<CreditCard size={20} className="text-[#635BFF]" />}
                  bannerSrc="/payment-banners/stripe-banner.png"
                  bannerAlt="Stripe — Visa, Mastercard, Amex, Apple Pay, Google Pay"
                  methods={STRIPE_METHODS}
                  accentColor="border-[#635BFF]/40 bg-[#635BFF]/5"
                  tagline="Powered by Stripe — PCI DSS Level 1 Certified"
                />

                <PaymentOption
                  id="paynow"
                  selected={form.payment_method === "paynow"}
                  onSelect={() => setForm((f) => ({ ...f, payment_method: "paynow" }))}
                  label="Pay with Paynow Zimbabwe"
                  subtitle="Mobile money & cards — settled in USD"
                  icon={<Smartphone size={20} className="text-[#E31837]" />}
                  bannerSrc="/payment-banners/paynow-banner.png"
                  bannerAlt="Paynow — EcoCash, OneMoney, InnBucks, Visa, Mastercard"
                  methods={PAYNOW_METHODS}
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

          {/* ── RIGHT: Order Summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-obsidian-800 border border-obsidian-700 rounded-xl p-6 sticky top-24 space-y-5">
              <h2 className="font-display font-semibold text-obsidian-100 pb-4 border-b border-obsidian-700">
                Order Summary
              </h2>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product_id} className="flex gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-obsidian-700 shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold-500 text-zinc-950 rounded-full text-[9px] font-bold flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-obsidian-200 text-xs leading-snug line-clamp-2">{item.name}</p>
                      <p className="text-gold-500 text-xs font-mono font-bold mt-0.5">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-obsidian-700 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-obsidian-400">Subtotal</span>
                  <span className="text-obsidian-100 font-mono">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-obsidian-400">
                    {deliveryMethod === "collection" ? "Collection" : "Delivery"}
                  </span>
                  {deliveryMethod === "collection" ? (
                    <span className="text-green-400 font-mono font-semibold">FREE</span>
                  ) : deliveryZone ? (
                    <span className="text-obsidian-100 font-mono">${shippingFee.toFixed(2)}</span>
                  ) : (
                    <span className="text-obsidian-500 text-xs">Select zone above</span>
                  )}
                </div>
              </div>

              <div className="border-t border-obsidian-700 pt-4">
                <div className="flex justify-between items-baseline mb-6">
                  <span className="text-obsidian-100 font-semibold">Total (USD)</span>
                  <span className="text-gold-500 font-bold font-mono text-2xl">
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

                <p className="text-obsidian-600 text-[11px] text-center mt-3 leading-relaxed font-mono">
                  By proceeding you agree to our{" "}
                  <Link href="/legal/terms" className="text-obsidian-400 hover:text-gold-500">
                    Terms
                  </Link>
                  . Payment by {form.payment_method === "stripe" ? "Stripe, Inc." : "Paynow Zimbabwe"} · USD only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const inputCls =
  "w-full bg-obsidian-900 border border-obsidian-600 rounded-lg px-4 py-3 text-obsidian-100 text-sm placeholder:text-obsidian-600 focus:outline-none focus:border-gold-500 transition-colors";
const labelCls = "block text-obsidian-400 text-xs font-medium mb-1.5 uppercase tracking-wide";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
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
  label, name, type = "text", value, onChange, placeholder, className = "",
}: {
  label: string; name: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label className={labelCls}>{label}</label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} className={inputCls}
      />
    </div>
  );
}

function MethodCard({
  active, onClick, icon, label, sub,
}: {
  active: boolean; onClick: () => void;
  icon: React.ReactNode; label: string; sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border-2 p-4 text-left transition-all duration-150 ${
        active
          ? "border-gold-500 bg-gold-500/8"
          : "border-obsidian-700 bg-obsidian-900 hover:border-obsidian-500"
      }`}
    >
      <div className={`mb-1.5 ${active ? "text-gold-500" : "text-obsidian-400"}`}>{icon}</div>
      <p className={`font-semibold text-sm ${active ? "text-obsidian-50" : "text-obsidian-300"}`}>{label}</p>
      <p className="text-obsidian-500 text-xs">{sub}</p>
    </button>
  );
}

function PaymentOption({
  id, selected, onSelect, label, subtitle, icon, bannerSrc, bannerAlt,
  methods, accentColor, tagline,
}: {
  id: string; selected: boolean; onSelect: () => void; label: string;
  subtitle: string; icon: React.ReactNode; bannerSrc: string; bannerAlt: string;
  methods: string[]; accentColor: string; tagline: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-200 ${
        selected ? `${accentColor} border-current shadow-sm` : "border-obsidian-700 bg-obsidian-900 hover:border-obsidian-500"
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
          selected ? "border-gold-500 bg-gold-500" : "border-obsidian-600"
        }`}>
          {selected && <CheckCircle size={12} className="text-zinc-950" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            {icon}
            <span className="text-obsidian-100 font-semibold text-sm">{label}</span>
          </div>
          <p className="text-obsidian-500 text-xs">{subtitle}</p>
        </div>
      </div>

      <div className="relative w-full h-16 rounded-lg overflow-hidden bg-obsidian-800 border border-obsidian-700 mb-3">
        <Image src={bannerSrc} alt={bannerAlt} fill className="object-contain p-2" onError={() => {}} />
        <div className="absolute inset-0 flex items-center justify-center gap-2 flex-wrap px-3">
          {methods.map((m) => (
            <span key={m} className="px-2 py-0.5 bg-obsidian-700 border border-obsidian-600 rounded text-[10px] text-obsidian-300 font-medium">
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
