import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MapPin } from "lucide-react";
import { hasPermission } from "@/lib/roles";
import type { Role } from "@/types";

export const metadata = { title: "Agents | MUFASA Admin" };

export default async function AgentsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!me || !hasPermission(me.role as Role, "agents:read")) redirect("/admin/dashboard");

  const { data: agents } = await supabase
    .from("agent_profiles")
    .select("*, profile:profiles(id, full_name, email, phone, status, username)")
    .order("created_at", { ascending: false });

  const canManage = hasPermission(me.role as Role, "agents:create");

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <MapPin size={24} className="text-gold-400" /> Agents
          </h1>
          <p className="text-obsidian-400 text-sm mt-1">
            {agents?.length ?? 0} distribution partners
          </p>
        </div>
        {canManage && (
          <a
            href="/admin/staff"
            className="text-sm text-gold-400 hover:text-gold-300 border border-gold-500/30 px-4 py-2 rounded-lg transition-colors"
          >
            Add Agent via Staff
          </a>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Agents", value: agents?.length ?? 0, color: "text-gold-400" },
          { label: "Active", value: agents?.filter((a) => a.is_active).length ?? 0, color: "text-emerald-400" },
          { label: "Total Sales", value: `$${(agents?.reduce((s, a) => s + (a.total_sales ?? 0), 0) ?? 0).toFixed(0)}`, color: "text-blue-400" },
          { label: "Commissions Paid", value: `$${(agents?.reduce((s, a) => s + (a.total_commission ?? 0), 0) ?? 0).toFixed(0)}`, color: "text-purple-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-4">
            <p className="text-obsidian-500 text-xs font-medium uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Agents table */}
      <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl overflow-hidden">
        {!agents || agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <MapPin size={48} className="text-obsidian-700 mb-4" />
            <p className="text-obsidian-500 mb-2">No agents registered</p>
            {canManage && (
              <a href="/admin/staff" className="text-gold-400 text-sm hover:text-gold-300">
                Add an agent via Staff Management →
              </a>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-obsidian-800">
                  {["Agent", "Territory", "Markup", "Total Sales", "Commission", "Status"].map((h) => (
                    <th key={h} className="text-left text-obsidian-500 font-medium px-5 py-3 text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian-800">
                {agents.map((agent) => {
                  const profile = Array.isArray(agent.profile) ? agent.profile[0] : agent.profile;
                  const p = profile as { full_name?: string; username?: string; email?: string } | null;
                  const displayName = p?.full_name || p?.username || p?.email || "—";
                  return (
                    <tr key={agent.id} className="hover:bg-obsidian-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-obsidian-200 font-medium">{displayName}</p>
                        <p className="text-obsidian-500 text-xs">{(profile as { email?: string } | null)?.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-obsidian-300 text-sm">{agent.territory}</p>
                        <p className="text-obsidian-500 text-xs">{agent.town}</p>
                      </td>
                      <td className="px-5 py-3.5 text-gold-400 font-semibold">
                        {agent.markup_percentage}%
                      </td>
                      <td className="px-5 py-3.5 text-obsidian-300">
                        ${(agent.total_sales ?? 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-emerald-400">
                        ${(agent.total_commission ?? 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          agent.is_active
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-obsidian-700 text-obsidian-500"
                        }`}>
                          {agent.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
