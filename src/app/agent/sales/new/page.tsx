"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ProductListing {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
}

interface SaleItem {
  product_id: string;
  product_name: string;
  base_price: number;
  sale_price: number;
  quantity: number;
}

export default function NewAgentSalePage() {
  const [products, setProducts] = useState<ProductListing[]>([]);
  const [agentMarkup, setAgentMarkup] = useState(20);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [form, setForm] = useState({
    customer_name: "", customer_phone: "", payment_method: "cash", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Data fetched via backend API route — no client-side DB access.
    fetch("/api/agent/products")
      .then((r) => r.json())
      .then(({ products: p, markup_percentage: m }) => {
        setProducts(p ?? []);
        if (typeof m === "number") setAgentMarkup(m);
      })
      .catch(() => setError("Failed to load products"));
  }, []);

  function addProduct(product: ProductListing) {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      const salePrice = product.price * (1 + agentMarkup / 100);
      return [...prev, {
        product_id: product.id,
        product_name: product.name,
        base_price: product.price,
        sale_price: salePrice,
        quantity: 1,
      }];
    });
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  }

  function updateSalePrice(productId: string, newPrice: number) {
    setItems((prev) =>
      prev.map((i) => i.product_id === productId ? { ...i, sale_price: newPrice } : i)
    );
  }

  const baseTotal = items.reduce((s, i) => s + i.base_price * i.quantity, 0);
  const saleTotal = items.reduce((s, i) => s + i.sale_price * i.quantity, 0);
  const agentProfit = saleTotal - baseTotal;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) { setError("Add at least one product"); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/agent/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ ...i, subtotal: i.sale_price * i.quantity })),
          base_total: baseTotal,
          sale_total: saleTotal,
          agent_profit: agentProfit,
          payment_method: form.payment_method,
          customer_name: form.customer_name || null,
          customer_phone: form.customer_phone || null,
          notes: form.notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("Sale recorded successfully!");
      setItems([]);
      setForm({ customer_name: "", customer_phone: "", payment_method: "cash", notes: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record sale");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3 mb-8">
        <PlusCircle size={24} className="text-gold-400" /> Record Walk-in Sale
      </h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-6">
        {/* Left: product selection */}
        <div>
          <h2 className="text-obsidian-300 text-sm font-semibold mb-3">Add Products</h2>
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl max-h-80 overflow-y-auto divide-y divide-obsidian-800">
            {products.length === 0 ? (
              <p className="text-obsidian-500 text-sm text-center py-8">Loading products…</p>
            ) : products.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => addProduct(product)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-obsidian-800 transition-colors text-left"
              >
                <div>
                  <p className="text-obsidian-200 text-sm font-medium">{product.name}</p>
                  <p className="text-obsidian-500 text-xs">Base: ${product.price.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-gold-400 text-sm font-semibold">
                    ${(product.price * (1 + agentMarkup / 100)).toFixed(2)}
                  </p>
                  <p className="text-obsidian-500 text-xs">Stock: {product.stock_quantity}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Cart items */}
          <div className="mt-4 space-y-2">
            {items.map((item) => (
              <div key={item.product_id} className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-obsidian-200 text-sm font-medium">{item.product_name}</p>
                  <button type="button" onClick={() => removeItem(item.product_id)} className="text-rose-400 hover:text-rose-300">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-obsidian-500 text-xs">Qty</label>
                    <input
                      type="number" min={1}
                      value={item.quantity}
                      onChange={(e) => setItems((prev) =>
                        prev.map((i) => i.product_id === item.product_id
                          ? { ...i, quantity: parseInt(e.target.value) || 1 }
                          : i
                        )
                      )}
                      className="w-full bg-obsidian-800 border border-obsidian-700 rounded px-2 py-1.5 text-sm text-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-obsidian-500 text-xs">Base $</label>
                    <p className="mt-1 text-sm text-obsidian-400 py-1.5">${item.base_price.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-obsidian-500 text-xs">Sale price $</label>
                    <input
                      type="number" step="0.01" min={item.base_price}
                      value={item.sale_price.toFixed(2)}
                      onChange={(e) => updateSalePrice(item.product_id, parseFloat(e.target.value) || item.base_price)}
                      className="w-full bg-obsidian-800 border border-obsidian-700 rounded px-2 py-1.5 text-sm text-gold-400 mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {items.length > 0 && (
            <div className="mt-4 bg-obsidian-900 border border-gold-500/20 rounded-xl p-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-obsidian-400">Your cost (base):</span>
                <span className="text-obsidian-300">${baseTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-obsidian-400">Customer pays:</span>
                <span className="text-gold-400 font-semibold">${saleTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-obsidian-800 pt-2 mt-2">
                <span className="text-emerald-400 font-semibold">Your profit:</span>
                <span className="text-emerald-400 font-bold">${agentProfit.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: customer info */}
        <div className="space-y-4">
          <h2 className="text-obsidian-300 text-sm font-semibold">Customer Details (optional)</h2>
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-4 space-y-3">
            <div>
              <label className="text-obsidian-400 text-xs">Customer Name</label>
              <input
                value={form.customer_name}
                onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
                placeholder="Walk-in customer"
                className="w-full mt-1 bg-obsidian-800 border border-obsidian-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500/50"
              />
            </div>
            <div>
              <label className="text-obsidian-400 text-xs">Phone</label>
              <input
                value={form.customer_phone}
                onChange={(e) => setForm((f) => ({ ...f, customer_phone: e.target.value }))}
                placeholder="+263 7x xxx xxxx"
                className="w-full mt-1 bg-obsidian-800 border border-obsidian-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500/50"
              />
            </div>
            <div>
              <label className="text-obsidian-400 text-xs">Payment Method *</label>
              <select
                value={form.payment_method}
                onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value }))}
                className="w-full mt-1 bg-obsidian-800 border border-obsidian-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500/50"
              >
                {["cash", "ecocash", "bank_transfer", "innbucks", "other"].map((m) => (
                  <option key={m} value={m} className="capitalize">{m.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-obsidian-400 text-xs">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
                placeholder="Any notes..."
                className="w-full mt-1 bg-obsidian-800 border border-obsidian-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500/50 resize-none"
              />
            </div>
          </div>

          {error && <p className="text-rose-400 text-sm bg-rose-500/10 px-3 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-emerald-400 text-sm bg-emerald-500/10 px-3 py-2 rounded-lg">{success}</p>}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            <ShoppingCart size={16} className="mr-2" />
            Record Sale {items.length > 0 && `— $${saleTotal.toFixed(2)}`}
          </Button>
        </div>
      </form>
    </div>
  );
}
