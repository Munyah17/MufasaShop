import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TrendingUp, PlusCircle } from "lucide-react";

export const metadata = { title: "My Sales | Agent Portal" };

export default async function AgentSalesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: sales } = await supabase
    .from("agent_sales")
    .select("*")
    .eq("agent_id", user.id)
    .order("created_at", { ascending: false });

  const totalRevenue = sales?.reduce((s, x) => s + (x.sale_total ?? 0), 0) ?? 0;
  const totalProfit = sales?.reduce((s, x) => s + (x.agent_profit ?? 0), 0) ?? 0;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <TrendingUp size={24} className="text-gold-400" /> My Sales
          </h1>
          <p className="text-obsidian-400 text-sm mt-1">
            {sales?.length ?? 0} transactions · ${totalRevenue.toFixed(2)} revenue · ${totalProfit.toFixed(2)} profit
          </p>
        </div>
        <a
          href="/agent/sales/new"
          className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-obsidian-900 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
        >
          <PlusCircle size={16} /> New Sale
        </a>
      </div>

      <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl overflow-hidden">
        {!sales || sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <TrendingUp size={48} className="text-obsidian-700 mb-4" />
            <p className="text-obsidian-500 mb-2">No sales recorded yet</p>
            <a href="/agent/sales/new" className="text-gold-400 text-sm hover:text-gold-300">Record your first sale →</a>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-obsidian-800">
                {["Date", "Customer", "Base Total", "Sold For", "Profit", "Payment"].map((h) => (
                  <th key={h} className="text-left text-obsidian-500 font-medium px-5 py-3 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-800">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-obsidian-800/40">
                  <td className="px-5 py-3.5 text-obsidian-400 text-xs whitespace-nowrap">
                    {new Date(sale.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-obsidian-200">{sale.customer_name ?? "Walk-in"}</p>
                    {sale.customer_phone && <p className="text-obsidian-500 text-xs">{sale.customer_phone}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-obsidian-400">${sale.base_total?.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-gold-400 font-semibold">${sale.sale_total?.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-emerald-400 font-semibold">+${sale.agent_profit?.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-obsidian-400 capitalize text-xs">{sale.payment_method ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
