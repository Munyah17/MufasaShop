import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { hasPermission } from "@/lib/roles";
import type { Role, Order } from "@/types";

export const metadata = { title: "Orders | MUFASA Admin" };

const STATUS_STYLE: Record<string, string> = {
  pending:          "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  awaiting_payment: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  paid:             "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  processing:       "text-blue-400 bg-blue-400/10 border-blue-400/20",
  shipped:          "text-sky-400 bg-sky-400/10 border-sky-400/20",
  delivered:        "text-green-400 bg-green-400/10 border-green-400/20",
  cancelled:        "text-red-400 bg-red-400/10 border-red-400/20",
  failed:           "text-rose-400 bg-rose-400/10 border-rose-400/20",
  refunded:         "text-purple-400 bg-purple-400/10 border-purple-400/20",
};

const PAYMENT_STYLE: Record<string, string> = {
  stripe: "text-indigo-300",
  paynow: "text-amber-300",
};

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: me } = await supabase.from("profiles").select("role, branch_id").eq("id", user.id).single();
  if (!me) redirect("/auth/login");

  const role = me.role as Role;
  const canSeeAll = hasPermission(role, "orders:read:all");
  const canSeeFinancials = hasPermission(role, "analytics:full");

  let query = supabase
    .from("orders")
    .select("id, customer_name, customer_email, status, payment_method, payment_status, total, fulfillment_type, created_at, agent_id, delivery_id", { count: "exact" })
    .order("created_at", { ascending: false });

  if (!canSeeAll) {
    if (role === "supervisor" || role === "assistant") {
      if (me.branch_id) query = query.eq("branch_id", me.branch_id);
    } else if (role === "agent") {
      query = query.eq("agent_id", user.id);
    } else if (role === "delivery") {
      query = query.eq("delivery_id", user.id);
    }
  }

  if (params.status) query = query.eq("status", params.status);

  const { data: orders, count } = await query.limit(50);

  const statusTabs = ["all", "awaiting_payment", "paid", "processing", "shipped", "delivered", "cancelled"];

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <ShoppingBag size={24} className="text-gold-400" /> Orders
          </h1>
          <p className="text-obsidian-400 text-sm mt-1">{count ?? 0} total</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1.5 flex-wrap mb-6">
        {statusTabs.map((s) => (
          <a
            key={s}
            href={s === "all" ? "/admin/orders" : `/admin/orders?status=${s}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
              (params.status ?? "all") === s
                ? "bg-gold-500 text-obsidian-900"
                : "bg-obsidian-800 text-obsidian-400 hover:text-white border border-obsidian-700"
            }`}
          >
            {s.replace("_", " ")}
          </a>
        ))}
      </div>

      {/* Orders table */}
      <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl overflow-hidden">
        {!orders || orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <ShoppingBag size={48} className="text-obsidian-700 mb-4" />
            <p className="text-obsidian-500">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-obsidian-800">
                  {["Order ID", "Customer", "Payment", "Fulfillment", canSeeFinancials ? "Total" : null, "Status", "Date"].filter(Boolean).map((h) => (
                    <th key={h} className="text-left text-obsidian-500 font-medium px-5 py-3 text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-obsidian-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-gold-400 text-xs">#{order.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-obsidian-200 font-medium">{order.customer_name}</p>
                      <p className="text-obsidian-500 text-xs">{order.customer_email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium ${PAYMENT_STYLE[order.payment_method ?? ""] ?? "text-obsidian-400"}`}>
                        {order.payment_method ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-obsidian-400 text-xs">
                      {order.fulfillment_type?.replace("_", " ") ?? "standard"}
                    </td>
                    {canSeeFinancials && (
                      <td className="px-5 py-3.5 font-semibold text-gold-300">
                        ${order.total?.toFixed(2)}
                      </td>
                    )}
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border capitalize ${STATUS_STYLE[order.status] ?? "text-obsidian-400 bg-obsidian-800 border-obsidian-700"}`}>
                        {order.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-obsidian-500 text-xs whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
