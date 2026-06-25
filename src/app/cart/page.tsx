"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, itemCount, clearCart } = useCartStore();
  const cartTotal = total();
  const count = itemCount();

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="w-24 h-24 rounded-full bg-obsidian-800 border border-obsidian-700 flex items-center justify-center">
          <ShoppingBag size={36} className="text-obsidian-500" />
        </div>
        <div>
          <h2 className="font-display font-bold text-2xl text-obsidian-100 mb-2">
            Your cart is empty
          </h2>
          <p className="text-obsidian-500 max-w-sm">
            Looks like you haven&apos;t added anything yet. Explore our premium collection.
          </p>
        </div>
        <Link href="/products">
          <Button variant="gold" size="lg">
            <ShoppingBag size={18} /> Shop Now
          </Button>
        </Link>
      </div>
    );
  }

  const shipping = cartTotal >= 150 ? 0 : 15;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-obsidian-50">
              Shopping Cart
            </h1>
            <p className="text-obsidian-400 text-sm mt-1">{count} {count === 1 ? "item" : "items"}</p>
          </div>
          <button
            onClick={clearCart}
            className="text-obsidian-500 hover:text-red-400 text-sm transition-colors"
          >
            Clear cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.product_id}
                className="flex gap-4 p-4 bg-obsidian-800 border border-obsidian-700 rounded-xl"
              >
                {/* Image */}
                <Link href={`/products/${item.slug}`} className="shrink-0">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-obsidian-700">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.slug}`}>
                    <h3 className="text-obsidian-100 font-semibold text-sm leading-snug hover:text-gold-400 transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-obsidian-400 text-xs mt-0.5">
                    ${item.price.toFixed(2)} each
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    {/* Qty control */}
                    <div className="flex items-center border border-obsidian-600 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="px-2.5 py-1.5 text-obsidian-400 hover:text-gold-500 hover:bg-obsidian-700 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-3 py-1.5 text-obsidian-100 text-sm font-medium border-x border-obsidian-600 min-w-[2.5rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock_quantity}
                        className="px-2.5 py-1.5 text-obsidian-400 hover:text-gold-500 hover:bg-obsidian-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-gold-500 font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="p-1.5 text-obsidian-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-obsidian-400 hover:text-gold-500 text-sm transition-colors mt-2"
            >
              <ArrowLeft size={15} /> Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-obsidian-800 border border-obsidian-700 rounded-xl p-6 sticky top-24">
              <h2 className="font-display font-semibold text-obsidian-100 mb-5 pb-4 border-b border-obsidian-700">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between">
                  <span className="text-obsidian-400">Subtotal ({count} items)</span>
                  <span className="text-obsidian-100">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-obsidian-400">Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-400 font-medium">Free</span>
                  ) : (
                    <span className="text-obsidian-100">${shipping.toFixed(2)}</span>
                  )}
                </div>
                {shipping > 0 && (
                  <p className="text-obsidian-500 text-xs">
                    Free shipping on orders over $150
                  </p>
                )}
              </div>

              <div className="border-t border-obsidian-700 pt-4 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-obsidian-100 font-semibold">Total</span>
                  <span className="text-gold-500 font-bold text-xl">
                    ${(cartTotal + shipping).toFixed(2)}
                  </span>
                </div>
              </div>

              <Link href="/checkout">
                <Button variant="gold" fullWidth size="lg">
                  Checkout <ArrowRight size={16} />
                </Button>
              </Link>

              {/* Payment method icons */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-obsidian-600 text-xs">Secure payment via</span>
                <span className="px-1.5 py-0.5 bg-obsidian-700 border border-obsidian-600 rounded text-[10px] text-obsidian-400">Stripe</span>
                <span className="px-1.5 py-0.5 bg-obsidian-700 border border-obsidian-600 rounded text-[10px] text-obsidian-400">Paynow</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
