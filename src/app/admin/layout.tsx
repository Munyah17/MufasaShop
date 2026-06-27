import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { hasPermission } from "@/lib/roles";

export const metadata = { title: "Admin Panel | MUFASA" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/admin/dashboard");

  const { data: profile } = await supabase
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
