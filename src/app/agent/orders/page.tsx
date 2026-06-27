import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ShoppingBag } from "lucide-react";

export const metadata = { title: "Territory Orders | Agent Portal" };

export default async function AgentOrdersPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("id, customer_name, customer_phone, status, total, fulfillment_type, created_at, shipping_address, agent_fulfillment_fee")
    .eq("agent_id", user.id)
    .order("created_at", { ascending: false });

  const pending = orders?.filter((o) => !["delivered", "cancelled", "failed", "refunded"].includes(o.status)) ?? [];

  const STATUS_STYLE: Record<string, string> = {
    paid:       "text-emerald-400 bg-emerald-400/10",
    processing: "text-blue-400 bg-blue-400/10",
    shipped:    "text-sky-400 bg-sky-400/10",
    delivered:  "text-green-400 bg-green-400/10",
    cancelled:  "text-red-400 bg-red-400/10",
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <ShoppingBag size={24} className="text-gold-400" /> Territory Orders
        </h1>
        <p className="text-obsidian-400 text-sm mt-1">
          {pending.length} active · {orders?.length ?? 0} total
        </p>
      </div>

      <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl overflow-hidden">
        {!orders || orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <ShoppingBag size={48} className="text-obsidian-700 mb-4" />
            <p className="text-obsidian-500 text-sm">No orders assigned to your territory yet</p>
          </div>
        ) : (
          <div className="divide-y divide-obsidian-800">
            {orders.map((order) => {
              const addr = order.shipping_address as { city?: string; line1?: string } | null;
              return (
                <div key={order.id} className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-obsidian-200 font-semibold">{order.customer_name}</p>
                      <p className="text-obsidian-500 text-xs font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gold-400 font-bold">${order.total?.toFixed(2)}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block capitalize ${STATUS_STYLE[order.status] ?? "text-obsidian-400 bg-obsidian-800"}`}>
                        {order.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-obsidian-500 mt-2">
                    <span>{new Date(order.created_at).toLocaleString()}</span>
                    {addr?.city && <span>📍 {addr.city}</span>}
                    {order.agent_fulfillment_fee && (
                      <span className="text-emerald-400 font-medium">
                        +${order.agent_fulfillment_fee.toFixed(2)} fulfillment fee
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
