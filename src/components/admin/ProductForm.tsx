"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import type { Category, Product, ProductImage } from "@/types";

interface ImageRow {
  url: string;
  alt: string;
  is_primary: boolean;
}

interface ProductFormProps {
  product?: Product & { images: ProductImage[] };
  categories: Category[];
}

function slugify(val: string) {
  return val
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugManual, setSlugManual] = useState(isEdit);
  const [description, setDescription] = useState(product?.description ?? "");
  const [shortDesc, setShortDesc] = useState(product?.short_description ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [compareAt, setCompareAt] = useState(product?.compare_at_price?.toString() ?? "");
  const [stock, setStock] = useState(product?.stock_quantity?.toString() ?? "0");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [tags, setTags] = useState((product?.tags ?? []).join(", "));
  const [images, setImages] = useState<ImageRow[]>(
    product?.images?.length
      ? product.images.map((img) => ({ url: img.url, alt: img.alt ?? "", is_primary: img.is_primary }))
      : [{ url: "", alt: "", is_primary: true }]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleNameChange(val: string) {
    setName(val);
    if (!slugManual) setSlug(slugify(val));
  }

  function addImage() {
    setImages((prev) => [...prev, { url: "", alt: "", is_primary: false }]);
  }

  function removeImage(i: number) {
    setImages((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      if (next.length > 0 && !next.some((img) => img.is_primary)) {
        next[0].is_primary = true;
      }
      return next;
    });
  }

  function setPrimary(i: number) {
    setImages((prev) => prev.map((img, idx) => ({ ...img, is_primary: idx === i })));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !slug.trim() || !price) {
      setError("Name, slug, and price are required.");
      return;
    }

    setSaving(true);

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      short_description: shortDesc.trim() || null,
      price: parseFloat(price),
      compare_at_price: compareAt ? parseFloat(compareAt) : null,
      stock_quantity: parseInt(stock, 10) || 0,
      category_id: categoryId || null,
      is_active: isActive,
      is_featured: isFeatured,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      images: images.filter((img) => img.url.trim()),
    };

    const url = isEdit
      ? `/api/admin/products/${product!.id}`
      : "/api/admin/products";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to save product.");
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  const inputCls =
    "w-full bg-obsidian-900 border border-obsidian-700 rounded-lg px-4 py-2.5 text-obsidian-100 text-sm placeholder:text-obsidian-600 focus:outline-none focus:border-gold-500 transition-colors";
  const labelCls = "block text-obsidian-400 text-xs uppercase tracking-wide font-medium mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="text-obsidian-400 hover:text-gold-400 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            {isEdit ? "Edit Product" : "New Product"}
          </h1>
          {isEdit && <p className="text-obsidian-500 text-xs font-mono mt-0.5">{product!.id}</p>}
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic info */}
        <Section title="Basic Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Product Name *</label>
              <input
                className={inputCls}
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Samsung Galaxy S25 Ultra"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Slug * (URL path)</label>
              <input
                className={inputCls}
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
                placeholder="samsung-galaxy-s25-ultra"
                required
              />
              <p className="text-obsidian-600 text-xs mt-1">
                /products/<span className="text-obsidian-400">{slug || "…"}</span>
              </p>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Short Description</label>
              <input
                className={inputCls}
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="One-line summary shown on product cards"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Full Description</label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed product description…"
              />
            </div>
          </div>
        </Section>

        {/* Pricing & Stock */}
        <Section title="Pricing & Inventory">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Price (USD) *</label>
              <input
                className={inputCls}
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className={labelCls}>Compare-at Price</label>
              <input
                className={inputCls}
                type="number"
                step="0.01"
                min="0"
                value={compareAt}
                onChange={(e) => setCompareAt(e.target.value)}
                placeholder="Original / crossed-out price"
              />
            </div>
            <div>
              <label className={labelCls}>Stock Quantity</label>
              <input
                className={inputCls}
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        </Section>

        {/* Organisation */}
        <Section title="Organisation">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Category</label>
              <select
                className={inputCls}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">— No category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Tags (comma-separated)</label>
              <input
                className={inputCls}
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="wireless, premium, sale"
              />
            </div>
          </div>

          <div className="flex gap-6 mt-4">
            <Toggle
              checked={isActive}
              onChange={setIsActive}
              label="Active"
              description="Visible to customers in the store"
            />
            <Toggle
              checked={isFeatured}
              onChange={setIsFeatured}
              label="Featured"
              description="Shown in featured sections on the home page"
            />
          </div>
        </Section>

        {/* Images */}
        <Section title="Images">
          <p className="text-obsidian-500 text-xs mb-3">
            Paste image URLs. The first image (or the one marked Primary) is used as the card thumbnail.
          </p>
          <div className="space-y-3">
            {images.map((img, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    className={inputCls}
                    value={img.url}
                    onChange={(e) =>
                      setImages((prev) =>
                        prev.map((row, idx) => idx === i ? { ...row, url: e.target.value } : row)
                      )
                    }
                    placeholder="https://…/image.jpg"
                  />
                  <input
                    className={inputCls}
                    value={img.alt}
                    onChange={(e) =>
                      setImages((prev) =>
                        prev.map((row, idx) => idx === i ? { ...row, alt: e.target.value } : row)
                      )
                    }
                    placeholder="Alt text (optional)"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setPrimary(i)}
                  className={`shrink-0 px-2 py-2.5 rounded-lg text-xs font-medium border transition-colors ${
                    img.is_primary
                      ? "bg-gold-500 text-obsidian-900 border-gold-500"
                      : "bg-obsidian-800 text-obsidian-400 border-obsidian-700 hover:border-gold-500"
                  }`}
                  title="Set as primary image"
                >
                  {img.is_primary ? "Primary" : "Set"}
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="shrink-0 p-2.5 text-obsidian-500 hover:text-rose-400 transition-colors"
                  title="Remove image"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addImage}
            className="mt-3 flex items-center gap-1.5 text-gold-400 hover:text-gold-300 text-sm transition-colors"
          >
            <Plus size={14} /> Add image
          </button>
        </Section>

        {error && (
          <div className="px-4 py-3 bg-red-900/30 border border-red-600/40 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 text-obsidian-900 font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors"
          >
            <Save size={15} />
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-6 py-2.5 rounded-xl border border-obsidian-700 text-obsidian-400 hover:text-white hover:border-obsidian-500 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-5">
      <h2 className="text-obsidian-300 text-xs font-semibold uppercase tracking-widest mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`w-10 h-5 rounded-full transition-colors ${checked ? "bg-gold-500" : "bg-obsidian-700"}`}
        />
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : ""}`}
        />
      </div>
      <div>
        <p className="text-obsidian-200 text-sm font-medium">{label}</p>
        <p className="text-obsidian-500 text-xs">{description}</p>
      </div>
    </label>
  );
}
