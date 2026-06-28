import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileWrapper } from "@/components/admin/AdminMobileWrapper";
import { hasPermission } from "@/lib/roles";

export const metadata = { title: "Admin Panel | MUFASA" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/admin/dashboard");

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
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <AdminSidebar profile={profile} />
      </div>

      {/* Main content column — includes mobile top bar */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminMobileWrapper profile={profile} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
