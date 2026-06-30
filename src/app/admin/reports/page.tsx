import { createAdminClient } from "@/lib/supabase/server";
import { BarChart3, TrendingUp, ShoppingBag, DollarSign, Users, Package } from "lucide-react";

export const metadata = { title: "Reports | MUFASA Admin" };

async function getStats() {
  const db = createAdminClient();
  const [orders, products, staff, revenue] = await Promise.all([
    db.from("orders").select("id, total, status, created_at", { count: "exact" }),
    db.from("products").select("id", { count: "exact" }).eq("is_active", true),
    db.from("profiles").select("id", { count: "exact" }).neq("role", "customer"),
    db.from("orders").select("total").in("status", ["paid", "delivered", "completed"]),
  ]);

  const totalRevenue = (revenue.data ?? []).reduce((s, o) => s + (o.total ?? 0), 0);
  const thisMonth = new Date();
  thisMonth.setDate(1); thisMonth.setHours(0, 0, 0, 0);

  const monthlyOrders = (orders.data ?? []).filter(
    (o) => new Date(o.created_at) >= thisMonth
  );
  const monthlyRevenue = monthlyOrders
    .filter((o) => ["paid", "delivered", "completed"].includes(o.status))
    .reduce((s, o) => s + (o.total ?? 0), 0);

  return {
    totalOrders: orders.count ?? 0,
    totalRevenue,
    activeProducts: products.count ?? 0,
    staffCount: staff.count ?? 0,
    monthlyOrders: monthlyOrders.length,
    monthlyRevenue,
  };
}

export default async function ReportsPage() {
  const stats = await getStats();

  const cards = [
    { label: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, sub: "All time · paid orders", icon: DollarSign, color: "text-gold-400 bg-gold-500/10" },
    { label: "This Month Revenue", value: `$${stats.monthlyRevenue.toFixed(2)}`, sub: "Current calendar month", icon: TrendingUp, color: "text-emerald-400 bg-emerald-500/10" },
    { label: "Total Orders", value: stats.totalOrders, sub: "All statuses", icon: ShoppingBag, color: "text-blue-400 bg-blue-500/10" },
    { label: "This Month Orders", value: stats.monthlyOrders, sub: "New orders this month", icon: BarChart3, color: "text-purple-400 bg-purple-500/10" },
    { label: "Active Products", value: stats.activeProducts, sub: "Listed in store", icon: Package, color: "text-orange-400 bg-orange-500/10" },
    { label: "Team Members", value: stats.staffCount, sub: "All roles except customers", icon: Users, color: "text-rose-400 bg-rose-500/10" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <BarChart3 size={24} className="text-gold-400" /> Reports
        </h1>
        <p className="text-obsidian-400 text-sm mt-1">Business overview and key metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {cards.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-mono">{value}</p>
            <p className="text-obsidian-100 text-sm font-medium mt-0.5">{label}</p>
            <p className="text-obsidian-500 text-xs mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-obsidian-900 border border-dashed border-obsidian-700 rounded-xl p-10 text-center">
        <BarChart3 size={40} className="text-obsidian-700 mx-auto mb-3" />
        <p className="text-obsidian-400 font-medium">Detailed charts coming soon</p>
        <p className="text-obsidian-600 text-sm mt-1">Sales trends, top products, and revenue graphs will appear here</p>
      </div>
    </div>
  );
}
