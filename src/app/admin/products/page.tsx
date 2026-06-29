import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Package, Plus, AlertCircle } from "lucide-react";
import { hasPermission } from "@/lib/roles";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import type { Role } from "@/types";

export const metadata = { title: "Products | MUFASA Admin" };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ category?: string; status?: string }> }) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!me || !hasPermission(me.role as Role, "products:read")) redirect("/admin/dashboard");

  const role = me.role as Role;
  const canCreate = hasPermission(role, "products:create");
  const canUpdate = hasPermission(role, "products:update");
  const canDelete = hasPermission(role, "products:delete");

  // Admin sees all products including inactive
  let query = supabase
    .from("products")
    .select("id, name, slug, price, stock_quantity, is_active, is_featured, category_id, created_at, category:categories(name)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (params.status === "inactive") query = query.eq("is_active", false);
  else if (params.status === "low_stock") query = query.lt("stock_quantity", 5).eq("is_active", true);
  else if (params.status === "active") query = query.eq("is_active", true);

  const { data: products, count } = await query.limit(100);

  const lowStockCount = products?.filter((p) => p.is_active && p.stock_quantity < 5).length ?? 0;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Package size={24} className="text-gold-400" /> Products
          </h1>
          <p className="text-obsidian-400 text-sm mt-1">{count ?? 0} total</p>
        </div>
        {canCreate && (
          <a
            href="/admin/products/new"
            className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-obsidian-900 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={16} /> Add Product
          </a>
        )}
      </div>

      {/* Low stock alert */}
      {lowStockCount > 0 && (
        <div className="mb-5 flex items-center gap-3 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3">
          <AlertCircle size={18} className="text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-sm">
            <strong>{lowStockCount}</strong> product{lowStockCount !== 1 ? "s" : ""} with low stock (under 5 units)
          </p>
          <a href="/admin/products?status=low_stock" className="ml-auto text-amber-400 text-xs hover:underline">View →</a>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5">
        {[["all", "All"], ["active", "Active"], ["inactive", "Inactive"], ["low_stock", "Low Stock"]].map(([key, label]) => (
          <a
            key={key}
            href={key === "all" ? "/admin/products" : `/admin/products?status=${key}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              (params.status ?? "all") === key
                ? "bg-gold-500 text-obsidian-900"
                : "bg-obsidian-800 text-obsidian-400 hover:text-white border border-obsidian-700"
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      {/* Products grid */}
      {!products || products.length === 0 ? (
        <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl flex flex-col items-center justify-center py-20">
          <Package size={48} className="text-obsidian-700 mb-4" />
          <p className="text-obsidian-500">No products found</p>
          {canCreate && (
            <a href="/admin/products/new" className="mt-4 text-gold-400 hover:text-gold-300 text-sm">
              + Add your first product
            </a>
          )}
        </div>
      ) : (
        <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-obsidian-800">
                {["Product", "Category", "Price", "Stock", "Status", canUpdate ? "Actions" : null].filter(Boolean).map((h) => (
                  <th key={h} className="text-left text-obsidian-500 font-medium px-5 py-3 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-800">
              {products.map((product) => {
                const cat = Array.isArray(product.category) ? product.category[0] : product.category;
                const isLow = product.is_active && product.stock_quantity < 5;
                return (
                  <tr key={product.id} className="hover:bg-obsidian-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-obsidian-200 font-medium">{product.name}</p>
                      <p className="text-obsidian-500 text-xs font-mono">/products/{product.slug}</p>
                    </td>
                    <td className="px-5 py-3.5 text-obsidian-400 text-xs">
                      {(cat as { name?: string } | null)?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-gold-300 font-semibold">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`font-medium ${isLow ? "text-rose-400" : "text-obsidian-300"}`}>
                        {product.stock_quantity}
                        {isLow && <span className="ml-1 text-xs text-rose-400">low</span>}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        product.is_active
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-obsidian-700 text-obsidian-500"
                      }`}>
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                      {product.is_featured && (
                        <span className="ml-1.5 text-xs font-medium px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-400">
                          Featured
                        </span>
                      )}
                    </td>
                    {canUpdate && (
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <a href={`/admin/products/${product.id}`} className="text-xs text-gold-400 hover:text-gold-300 font-medium">Edit</a>
                          {canDelete && (
                            <DeleteProductButton id={product.id} name={product.name} />
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
