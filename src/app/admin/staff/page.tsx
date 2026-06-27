import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Users, UserPlus, Search } from "lucide-react";
import { hasPermission, ROLE_LABELS, ROLE_COLORS } from "@/lib/roles";
import type { Role, Profile } from "@/types";
import { AddStaffModal } from "./AddStaffModal";

export const metadata = { title: "Staff | MUFASA Admin" };

export default async function StaffPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!me || !hasPermission(me.role as Role, "staff:read")) redirect("/admin/dashboard");

  const { data: staff } = await supabase
    .from("profiles")
    .select("id, email, full_name, username, role, status, branch_id, created_at")
    .neq("role", "customer")
    .order("created_at", { ascending: false });

  const canCreate = hasPermission(me.role as Role, "staff:create");
  const canUpdate = hasPermission(me.role as Role, "staff:update");
  const isSuperAdmin = me.role === "super_admin";

  const ROLE_ORDER: Role[] = ["super_admin", "admin", "supervisor", "assistant", "investor", "agent", "delivery"];
  const staffByRole: Record<string, Profile[]> = {};
  for (const role of ROLE_ORDER) staffByRole[role] = [];
  for (const member of staff ?? []) {
    if (staffByRole[member.role]) staffByRole[member.role].push(member as Profile);
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Users size={24} className="text-gold-400" /> Staff Management
          </h1>
          <p className="text-obsidian-400 text-sm mt-1">
            {staff?.length ?? 0} team members across all roles
          </p>
        </div>
        {canCreate && <AddStaffModal currentUserRole={me.role as Role} />}
      </div>

      {/* Staff by role */}
      {ROLE_ORDER.map((role) => {
        const members = staffByRole[role];
        if (members.length === 0) return null;
        return (
          <div key={role} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-bold px-2 py-1 rounded ${ROLE_COLORS[role]}`}>
                {ROLE_LABELS[role]}
              </span>
              <span className="text-obsidian-500 text-sm">{members.length} member{members.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl overflow-hidden">
              <div className="divide-y divide-obsidian-800">
                {members.map((member) => {
                  const displayName = member.full_name || member.username || member.email;
                  const isSelf = member.id === user.id;
                  const isTargetSuperAdmin = member.role === "super_admin";
                  const canEdit = canUpdate && !isSelf && (!isTargetSuperAdmin || isSuperAdmin);

                  return (
                    <div key={member.id} className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-obsidian-800 border border-obsidian-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-obsidian-300 text-sm font-bold">
                            {displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-obsidian-100 text-sm font-medium">{displayName}</p>
                            {isSelf && (
                              <span className="text-[10px] font-semibold text-gold-500 bg-gold-500/10 px-1.5 rounded">YOU</span>
                            )}
                          </div>
                          <p className="text-obsidian-500 text-xs">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          member.status === "active"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : member.status === "suspended"
                            ? "bg-rose-500/15 text-rose-400"
                            : "bg-obsidian-700 text-obsidian-400"
                        }`}>
                          {member.status}
                        </span>
                        <p className="text-obsidian-500 text-xs hidden sm:block">
                          {new Date(member.created_at).toLocaleDateString()}
                        </p>
                        {canEdit && !isTargetSuperAdmin && (
                          <a
                            href={`/admin/staff/${member.id}`}
                            className="text-xs text-gold-400 hover:text-gold-300 font-medium transition-colors"
                          >
                            Edit
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {(!staff || staff.length === 0) && (
        <div className="text-center py-20 bg-obsidian-900 border border-obsidian-800 rounded-xl">
          <Users size={48} className="text-obsidian-700 mx-auto mb-4" />
          <p className="text-obsidian-400">No staff members yet</p>
        </div>
      )}
    </div>
  );
}
