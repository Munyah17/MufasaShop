"use client";

import { useRouter, useSearchParams } from "next/navigation";

const categories = [
  { label: "All", value: "" },
  { label: "Smartphones", value: "smartphones" },
  { label: "Audio", value: "audio" },
  { label: "Wearables", value: "wearables" },
  { label: "Accessories", value: "accessories" },
  { label: "Laptops", value: "laptops" },
  { label: "Cameras", value: "cameras" },
];

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Name A-Z", value: "name" },
];

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  const currentCategory = searchParams.get("category") ?? "";
  const currentSort = searchParams.get("sort") ?? "newest";
  const isFeatured = searchParams.get("featured") === "true";

  return (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <h3 className="text-gold-500 text-[10px] font-semibold uppercase tracking-[0.2em] mb-3">
          Sort By
        </h3>
        <div className="space-y-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update("sort", opt.value)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${
                currentSort === opt.value
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "text-obsidian-400 hover:text-obsidian-100 hover:bg-obsidian-800"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-gold-500 text-[10px] font-semibold uppercase tracking-[0.2em] mb-3">
          Category
        </h3>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => update("category", cat.value)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${
                currentCategory === cat.value
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "text-obsidian-400 hover:text-obsidian-100 hover:bg-obsidian-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured */}
      <div>
        <h3 className="text-gold-500 text-[10px] font-semibold uppercase tracking-[0.2em] mb-3">
          Filter
        </h3>
        <button
          onClick={() => update("featured", isFeatured ? "" : "true")}
          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${
            isFeatured
              ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
              : "text-obsidian-400 hover:text-obsidian-100 hover:bg-obsidian-800"
          }`}
        >
          ⭐ Featured Only
        </button>
      </div>
    </div>
  );
}
