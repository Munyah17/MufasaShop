import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Truck, CheckCircle2, Clock, MapPin, Phone } from "lucide-react";

export const metadata = { title: "Dashboard | Delivery Portal" };

const STATUS_STYLE: Record<string, string> = {
  paid:       "text-blue-400 bg-blue-400/10",
  processing: "text-amber-400 bg-amber-400/10",
  shipped:    "text-sky-400 bg-sky-400/10",
  delivered:  "text-emerald-400 bg-emerald-400/10",
};

export default async function DeliveryDashboard() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [profileRes, deliveryProfileRes, ordersRes] = await Promise.all([
    supabase.from("profiles").select("full_name, username, email").eq("id", user.id).single(),
    supabase.from("delivery_profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("orders")
      .select("id, customer_name, customer_phone, status, total, shipping_address, created_at, fulfillment_type")
      .eq("delivery_id", user.id)
      .not("status", "in", "(cancelled,failed)")
      .order("created_at", { ascending: false }),
  ]);

  if (!profileRes.data) redirect("/auth/login");
  const profile = profileRes.data;
  const dp = deliveryProfileRes.data;
  const orders = ordersRes.data ?? [];
  const displayName = profile.full_name || profile.username || profile.email.split("@")[0];

  const active = orders.filter((o) => o.status !== "delivered");
  const todayDelivered = orders.filter(
    (o) => o.status === "delivered" && o.created_at.startsWith(new Date().toISOString().split("T")[0])
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white">Welcome, {displayName}</h1>
        <p className="text-obsidian-400 text-sm mt-1 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dp?.is_available ? "bg-emerald-400" : "bg-obsidian-600"}`} />
          {dp?.is_available ? "Available for deliveries" : "Not available"}
          {dp?.zone && <span className="text-obsidian-500">· {dp.zone}</span>}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Orders", value: active.length, color: "text-amber-400" },
          { label: "Delivered Today", value: todayDelivered.length, color: "text-emerald-400" },
          { label: "Total Trips", value: dp?.total_deliveries ?? 0, color: "text-blue-400" },
          { label: "Total Earned", value: `$${(dp?.total_earnings ?? 0).toFixed(2)}`, color: "text-gold-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-4">
            <p className="text-obsidian-500 text-xs font-medium uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Assigned orders */}
      <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-obsidian-800 flex items-center justify-between">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Truck size={16} className="text-gold-400" /> My Deliveries
          </h2>
          {active.length > 0 && (
            <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
              {active.length} active
            </span>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Truck size={40} className="text-obsidian-700 mb-3" />
            <p className="text-obsidian-500">No deliveries assigned yet</p>
          </div>
        ) : (
          <div className="divide-y divide-obsidian-800">
            {orders.map((order) => {
              const addr = order.shipping_address as { city?: string; line1?: string } | null;
              return (
                <div key={order.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-obsidian-200 font-semibold">{order.customer_name}</p>
                      <p className="text-obsidian-500 text-xs font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${STATUS_STYLE[order.status] ?? "text-obsidian-400 bg-obsidian-800"}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {order.customer_phone && (
                      <div className="flex items-center gap-2 text-sm text-obsidian-400">
                        <Phone size={13} className="text-obsidian-600" />
                        <a href={`tel:${order.customer_phone}`} className="hover:text-gold-400 transition-colors">
                          {order.customer_phone}
                        </a>
                      </div>
                    )}
                    {addr && (
                      <div className="flex items-center gap-2 text-sm text-obsidian-400">
                        <MapPin size={13} className="text-obsidian-600" />
                        <span>{addr.line1}{addr.city ? `, ${addr.city}` : ""}</span>
                      </div>
                    )}
                  </div>

                  {order.status !== "delivered" && (
                    <div className="mt-3 flex gap-2">
                      <a
                        href={`/api/delivery/update-status?order_id=${order.id}&status=shipped`}
                        className="px-3 py-1.5 bg-blue-500/15 border border-blue-500/25 text-blue-400 text-xs font-medium rounded-lg hover:bg-blue-500/25 transition-colors"
                      >
                        Mark as Picked Up
                      </a>
                      <a
                        href={`/api/delivery/update-status?order_id=${order.id}&status=delivered`}
                        className="px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-medium rounded-lg hover:bg-emerald-500/25 transition-colors"
                      >
                        <CheckCircle2 size={12} className="inline mr-1" /> Delivered
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
