import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TrendingUp, ShoppingBag, DollarSign, Package, Bell } from "lucide-react";

export const metadata = { title: "Dashboard | Agent Portal" };

export default async function AgentDashboard() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [profileRes, agentRes, salesRes, ordersRes, notifRes] = await Promise.all([
    supabase.from("profiles").select("full_name, username, email").eq("id", user.id).single(),
    supabase.from("agent_profiles").select("*").eq("id", user.id).single(),
    supabase.from("agent_sales").select("id, sale_total, agent_profit, created_at").eq("agent_id", user.id).order("created_at", { ascending: false }),
    supabase.from("orders").select("id, status, total, customer_name, created_at").eq("agent_id", user.id).order("created_at", { ascending: false }).limit(10),
    supabase.from("notifications").select("id, title, message, is_read, created_at").eq("recipient_id", user.id).order("created_at", { ascending: false }).limit(5),
  ]);

  if (!profileRes.data) redirect("/auth/login");
  const profile = profileRes.data;
  const agent = agentRes.data;
  const sales = salesRes.data ?? [];
  const orders = ordersRes.data ?? [];
  const notifications = notifRes.data ?? [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const displayName = profile.full_name || profile.username || profile.email.split("@")[0];
  const todaySales = sales.filter((s) => s.created_at?.startsWith(new Date().toISOString().split("T")[0]));
  const todayRevenue = todaySales.reduce((sum, s) => sum + (s.sale_total ?? 0), 0);
  const todayProfit = todaySales.reduce((sum, s) => sum + (s.agent_profit ?? 0), 0);
  const totalRevenue = sales.reduce((sum, s) => sum + (s.sale_total ?? 0), 0);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Welcome, {displayName}</h1>
          <p className="text-obsidian-400 text-sm mt-1">
            {agent?.territory ?? "Territory not set"} · {agent?.town ?? ""}
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 bg-orange-500/15 border border-orange-500/25 rounded-xl px-3 py-2">
            <Bell size={16} className="text-orange-400" />
            <span className="text-orange-400 text-sm font-semibold">{unreadCount} new notification{unreadCount !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-4">
          <p className="text-obsidian-500 text-xs font-medium uppercase tracking-wide">Wallet Balance</p>
          <p className="text-2xl font-bold text-gold-400 mt-1">${(agent?.wallet_balance ?? 0).toFixed(2)}</p>
          <p className="text-obsidian-500 text-xs mt-1">Available earnings</p>
        </div>
        <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-4">
          <p className="text-obsidian-500 text-xs font-medium uppercase tracking-wide">Today Sales</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">${todayRevenue.toFixed(2)}</p>
          <p className="text-obsidian-500 text-xs mt-1">{todaySales.length} transactions</p>
        </div>
        <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-4">
          <p className="text-obsidian-500 text-xs font-medium uppercase tracking-wide">Today Profit</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">${todayProfit.toFixed(2)}</p>
          <p className="text-obsidian-500 text-xs mt-1">Your markup earnings</p>
        </div>
        <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-4">
          <p className="text-obsidian-500 text-xs font-medium uppercase tracking-wide">Your Markup</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">{agent?.markup_percentage ?? 20}%</p>
          <p className="text-obsidian-500 text-xs mt-1">Max: {agent?.max_markup_percentage ?? 50}%</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent walk-in sales */}
        <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-obsidian-800">
            <h2 className="text-white font-semibold text-sm flex items-center gap-2">
              <TrendingUp size={16} className="text-gold-400" /> Recent Sales
            </h2>
            <a href="/agent/sales" className="text-gold-400 text-xs hover:text-gold-300">View all</a>
          </div>
          {sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-obsidian-500 text-sm">
              <TrendingUp size={28} className="mb-2 text-obsidian-700" />
              No sales yet — <a href="/agent/sales/new" className="text-gold-400 hover:underline ml-1">record your first</a>
            </div>
          ) : (
            <div className="divide-y divide-obsidian-800">
              {sales.slice(0, 6).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-obsidian-200 text-sm">${sale.sale_total?.toFixed(2)} sold</p>
                    <p className="text-obsidian-500 text-xs">{new Date(sale.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-emerald-400 text-sm font-semibold">+${sale.agent_profit?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Territory online orders */}
        <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-obsidian-800">
            <h2 className="text-white font-semibold text-sm flex items-center gap-2">
              <ShoppingBag size={16} className="text-gold-400" /> Territory Orders
            </h2>
            <a href="/agent/orders" className="text-gold-400 text-xs hover:text-gold-300">View all</a>
          </div>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-obsidian-500 text-sm">
              <ShoppingBag size={28} className="mb-2 text-obsidian-700" />
              No orders in your territory yet
            </div>
          ) : (
            <div className="divide-y divide-obsidian-800">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-obsidian-200 text-sm font-medium">{order.customer_name}</p>
                    <p className="text-obsidian-500 text-xs">#{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gold-400 text-sm font-semibold">${order.total?.toFixed(2)}</p>
                    <p className="text-obsidian-500 text-xs capitalize">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
