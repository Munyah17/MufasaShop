import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Truck } from "lucide-react";
import { hasPermission } from "@/lib/roles";
import type { Role } from "@/types";

export const metadata = { title: "Delivery | MUFASA Admin" };

const VEHICLE_ICON: Record<string, string> = {
  bike: "🏍️", car: "🚗", truck: "🚚", walk: "🚶",
};

export default async function DeliveryPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!me || !hasPermission(me.role as Role, "delivery:read:all")) redirect("/admin/dashboard");

  const [deliveryRes, pendingDeliveryRes] = await Promise.all([
    supabase
      .from("delivery_profiles")
      .select("*, profile:profiles(id, full_name, email, phone, status, username)")
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id, customer_name, total, status, fulfillment_type, delivery_id, created_at", { count: "exact" })
      .in("fulfillment_type", ["delivery", "external_delivery"])
      .not("status", "in", "(delivered,cancelled,failed)"),
  ]);

  const delivery = deliveryRes.data ?? [];
  const pendingDeliveries = pendingDeliveryRes.data ?? [];
  const available = delivery.filter((d) => d.is_available && d.is_active);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Truck size={24} className="text-gold-400" /> Delivery
          </h1>
          <p className="text-obsidian-400 text-sm mt-1">
            {available.length} available · {pendingDeliveries.length} orders need delivery
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Personnel", value: delivery.length },
          { label: "Available Now", value: available.length, color: "text-emerald-400" },
          { label: "Pending Deliveries", value: pendingDeliveries.length, color: "text-amber-400" },
          { label: "Unassigned", value: pendingDeliveries.filter((o) => !o.delivery_id).length, color: "text-rose-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-4">
            <p className="text-obsidian-500 text-xs font-medium uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color ?? "text-white"}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending deliveries */}
        <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-obsidian-800">
            <h2 className="text-white font-semibold text-sm">Orders Needing Delivery</h2>
          </div>
          {pendingDeliveries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-obsidian-500 text-sm">
              <Truck size={32} className="mb-3 text-obsidian-700" />
              All deliveries handled
            </div>
          ) : (
            <div className="divide-y divide-obsidian-800">
              {pendingDeliveries.slice(0, 10).map((order) => (
                <div key={order.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-obsidian-200 text-sm font-medium">{order.customer_name}</p>
                    <p className="text-obsidian-500 text-xs">#{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gold-400 text-sm font-semibold">${order.total?.toFixed(2)}</span>
                    {!order.delivery_id ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400">
                        Unassigned
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">
                        Assigned
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delivery personnel */}
        <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-obsidian-800">
            <h2 className="text-white font-semibold text-sm">Delivery Personnel</h2>
          </div>
          {delivery.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-obsidian-500 text-sm">
              <Truck size={32} className="mb-3 text-obsidian-700" />
              No delivery staff yet
            </div>
          ) : (
            <div className="divide-y divide-obsidian-800">
              {delivery.map((d) => {
                const profile = Array.isArray(d.profile) ? d.profile[0] : d.profile;
                const p = profile as { full_name?: string; username?: string; email?: string } | null;
                const displayName = p?.full_name || p?.username || p?.email || "—";
                return (
                  <div key={d.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{VEHICLE_ICON[d.vehicle_type] ?? "🚗"}</span>
                      <div>
                        <p className="text-obsidian-200 text-sm font-medium">{displayName}</p>
                        <p className="text-obsidian-500 text-xs">{d.zone ?? "No zone set"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        d.is_available && d.is_active
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-obsidian-700 text-obsidian-500"
                      }`}>
                        {!d.is_active ? "Inactive" : d.is_available ? "Available" : "Busy"}
                      </span>
                      <span className="text-obsidian-500 text-xs">{d.total_deliveries} trips</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
