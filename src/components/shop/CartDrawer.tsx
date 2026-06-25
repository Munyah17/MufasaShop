"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { Button } from "@/components/ui/Button";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, itemCount } =
    useCartStore();
  const count = itemCount();
  const cartTotal = total();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-obsidian-800 border-l border-obsidian-700 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-obsidian-700">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-gold-500" />
            <h2 className="font-display font-semibold text-obsidian-50 tracking-wide">
              Your Cart
            </h2>
            {count > 0 && (
              <span className="px-2 py-0.5 bg-gold-500 text-obsidian-900 text-xs font-bold rounded-full">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-obsidian-400 hover:text-gold-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-obsidian-700 flex items-center justify-center">
                <ShoppingBag size={28} className="text-obsidian-500" />
              </div>
              <div>
                <p className="text-obsidian-200 font-semibold mb-1">Your cart is empty</p>
                <p className="text-obsidian-500 text-sm">
                  Browse our premium collection to add items.
                </p>
              </div>
              <Button onClick={closeCart} variant="outline" size="sm">
                Continue Shopping
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product_id}
                className="flex gap-3 p-3 bg-obsidian-700 rounded-lg border border-obsidian-600"
              >
                {/* Image */}
                <div className="relative w-18 h-18 rounded-md overflow-hidden bg-obsidian-600 shrink-0" style={{ width: 72, height: 72 }}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-obsidian-100 text-sm font-medium leading-snug line-clamp-2">
                    {item.name}
                  </p>
                  <p className="text-gold-500 font-bold text-sm mt-1">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-obsidian-500 text-xs">${item.price.toFixed(2)} each</p>

                  {/* Quantity */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="w-6 h-6 rounded border border-obsidian-500 flex items-center justify-center text-obsidian-300 hover:border-gold-500 hover:text-gold-500 transition-colors"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="text-obsidian-100 text-sm w-6 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product_id, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.stock_quantity}
                      className="w-6 h-6 rounded border border-obsidian-500 flex items-center justify-center text-obsidian-300 hover:border-gold-500 hover:text-gold-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus size={10} />
                    </button>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="ml-auto p-1 text-obsidian-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-obsidian-700 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-obsidian-300 text-sm">Subtotal</span>
              <span className="text-gold-500 font-bold text-lg">${cartTotal.toFixed(2)}</span>
            </div>
            <p className="text-obsidian-500 text-xs">
              Shipping calculated at checkout. Taxes may apply.
            </p>
            <Link href="/checkout" onClick={closeCart}>
              <Button variant="gold" fullWidth size="lg">
                Proceed to Checkout
              </Button>
            </Link>
            <button
              onClick={closeCart}
              className="w-full text-center text-obsidian-400 hover:text-gold-500 text-sm transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
