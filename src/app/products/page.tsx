import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductFilters } from "@/components/shop/ProductFilters";
import type { Product } from "@/types";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    featured?: string;
    sort?: string;
    q?: string;
    page?: string;
  }>;
}

async function getProducts(params: {
  category?: string;
  featured?: string;
  sort?: string;
  q?: string;
  page?: string;
}): Promise<{ products: Product[]; total: number }> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("shop_products")
      .select("*, category:categories(*), images:shop_product_images(*)", { count: "exact" })
      .eq("is_active", true);

    // Category filter: resolve slug → id first
    if (params.category) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", params.category)
        .single();
      if (cat) {
        query = query.eq("category_id", cat.id);
      }
    }

    if (params.featured === "true") query = query.eq("is_featured", true);
    if (params.q) query = query.ilike("name", `%${params.q}%`);

    const sortMap: Record<string, { col: string; asc: boolean }> = {
      newest:       { col: "created_at", asc: false },
      "price-asc":  { col: "price",      asc: true  },
      "price-desc": { col: "price",      asc: false },
      name:         { col: "name",       asc: true  },
    };
    const sort = sortMap[params.sort ?? "newest"] ?? sortMap.newest;
    query = query.order(sort.col, { ascending: sort.asc });

    const page    = Math.max(1, parseInt(params.page ?? "1", 10));
    const perPage = 12;
    query = query.range((page - 1) * perPage, page * perPage - 1);

    const { data, count } = await query;
    return { products: (data as Product[]) ?? [], total: count ?? 0 };
  } catch {
    return { products: [], total: 0 };
  }
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { products, total } = await getProducts(params);

  const title =
    params.featured === "true"
      ? "Featured Products"
      : params.category
      ? params.category.charAt(0).toUpperCase() + params.category.slice(1)
      : params.q
      ? `Search: "${params.q}"`
      : "All Products";

  return (
    <div className="min-h-screen pt-24">
      {/* Page header */}
      <div className="bg-obsidian-900 border-b border-obsidian-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="relative pl-5">
            <div className="absolute left-0 top-0 w-1 h-full bg-gold-500 rounded-full" />
            <p className="text-gold-500 text-xs font-semibold uppercase tracking-[0.3em] mb-2">
              MUFASA Collection
            </p>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-obsidian-50">
              {title}
            </h1>
            <p className="text-obsidian-400 text-sm mt-2">
              {total} {total === 1 ? "product" : "products"} found
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-60 shrink-0">
            <Suspense>
              <ProductFilters />
            </Suspense>
          </aside>

          <div className="flex-1">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <span className="text-5xl mb-4">🔍</span>
                <h3 className="font-display text-xl text-obsidian-200 mb-2">No products found</h3>
                <p className="text-obsidian-500 text-sm">
                  Try a different category or search term.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
