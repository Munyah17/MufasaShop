import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ShoppingBag, TrendingUp, Package, Users, MapPin, Truck,
  Clock, CheckCircle2, AlertCircle, DollarSign,
} from "lucide-react";
import { hasPermission } from "@/lib/roles";
import type { Role } from "@/types";

function StatCard({
  label, value, sub, icon: Icon, color,
}: { label: string; value: string; sub: string; icon: React.FC<{ size?: number; className?: string }>; color: string }) {
  return (
    <div className={`bg-obsidian-900 border border-obsidian-800 rounded-xl p-5 flex items-start gap-4`}>
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-obsidian-400 text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        <p className="text-obsidian-500 text-xs mt-1">{sub}</p>
      </div>
    </div>
  );
}

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("full_name, role, username").eq("id", user.id).single();
  if (!profile) redirect("/auth/login");

  const role = profile.role as Role;
  const canSeeFinancials = hasPermission(role, "analytics:full");
  const displayName = profile.full_name || profile.username || "Staff";
  const today = new Date().toISOString().split("T")[0];

  // Fetch stats
  const [ordersRes, productsRes, staffRes, agentsRes] = await Promise.all([
    supabase.from("orders").select("id, status, total, created_at", { count: "exact" }),
    supabase.from("products").select("id, is_active, stock_quantity", { count: "exact" }),
    supabase.from("profiles").select("id, role", { count: "exact" }).neq("role", "customer"),
    supabase.from("agent_profiles").select("id", { count: "exact" }),
  ]);

  const orders = ordersRes.data ?? [];
  const products = productsRes.data ?? [];

  const todayOrders = orders.filter((o) => o.created_at?.startsWith(today));
  const pendingOrders = orders.filter((o) => ["pending", "awaiting_payment", "paid", "processing"].includes(o.status));
  const totalRevenue = orders.filter((o) => o.status === "paid" || o.status === "delivered")
    .reduce((s, o) => s + (o.total ?? 0), 0);
  const activeProducts = products.filter((p) => p.is_active).length;
  const lowStock = products.filter((p) => p.is_active && p.stock_quantity < 5).length;

  const recentOrders = orders
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  const statusColor: Record<string, string> = {
    pending: "text-yellow-400 bg-yellow-400/10",
    awaiting_payment: "text-orange-400 bg-orange-400/10",
    paid: "text-emerald-400 bg-emerald-400/10",
    processing: "text-blue-400 bg-blue-400/10",
    shipped: "text-sky-400 bg-sky-400/10",
    delivered: "text-green-400 bg-green-400/10",
    cancelled: "text-red-400 bg-red-400/10",
    failed: "text-rose-400 bg-rose-400/10",
    refunded: "text-purple-400 bg-purple-400/10",
  };

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white">
          Welcome back, {displayName}
        </h1>
        <p className="text-obsidian-400 mt-1 text-sm">
          {new Date().toLocaleDateString("en-ZW", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Today's Orders"
          value={String(todayOrders.length)}
          sub={`${pendingOrders.length} pending action`}
          icon={ShoppingBag}
          color="bg-blue-500/15 text-blue-400"
        />
        {canSeeFinancials && (
          <StatCard
            label="Total Revenue"
            value={`$${totalRevenue.toFixed(0)}`}
            sub="All paid orders"
            icon={DollarSign}
            color="bg-gold-500/15 text-gold-400"
          />
        )}
        <StatCard
          label="Active Products"
          value={String(activeProducts)}
          sub={lowStock > 0 ? `${lowStock} low stock` : "All stocked"}
          icon={Package}
          color={lowStock > 0 ? "bg-rose-500/15 text-rose-400" : "bg-emerald-500/15 text-emerald-400"}
        />
        <StatCard
          label="Staff Members"
          value={String(staffRes.count ?? 0)}
          sub={`${agentsRes.count ?? 0} agents`}
          icon={Users}
          color="bg-purple-500/15 text-purple-400"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-800">
          <h2 className="text-white font-semibold">Recent Orders</h2>
          <a href="/admin/orders" className="text-gold-400 text-sm hover:text-gold-300 transition-colors">
            View all →
          </a>
        </div>
        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingBag className="text-obsidian-600 mb-3" size={40} />
            <p className="text-obsidian-500 text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="divide-y divide-obsidian-800">
            {recentOrders.map((order) => (
              <a
                key={order.id}
                href={`/admin/orders?id=${order.id}`}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-obsidian-800/50 transition-colors"
              >
                <div>
                  <p className="text-obsidian-200 text-sm font-medium">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-obsidian-500 text-xs">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {canSeeFinancials && (
                    <span className="text-gold-400 text-sm font-semibold">
                      ${order.total?.toFixed(2)}
                    </span>
                  )}
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[order.status] ?? "text-obsidian-400 bg-obsidian-800"}`}>
                    {order.status.replace("_", " ")}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
