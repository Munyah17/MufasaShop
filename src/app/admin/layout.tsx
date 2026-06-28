import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { hasPermission } from "@/lib/roles";

export const metadata = { title: "Admin Panel | MUFASA" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Auth check: anon key is sufficient for supabase.auth.getUser()
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/admin/dashboard");

  // Data query: service_role bypasses RLS (deny-all policy)
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, email, role, username")
    .eq("id", user.id)
    .single();

  if (!profile || !hasPermission(profile.role, "admin_panel:access")) {
    redirect("/?error=unauthorized");
  }

  return (
    <div className="flex min-h-screen bg-obsidian-950">
      <div className="hidden lg:flex">
        <AdminSidebar profile={profile} />
      </div>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
