import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, LayoutDashboard, ShoppingBag, TrendingUp, PlusCircle, LogOut } from "lucide-react";

export const metadata = { title: "Agent Portal | MUFASA" };

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/agent/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, username, email")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "agent") redirect("/?error=unauthorized");

  const { data: agentProfile } = await supabase
    .from("agent_profiles")
    .select("territory, town, wallet_balance")
    .eq("id", user.id)
    .single();

  const displayName = profile.full_name || profile.username || profile.email.split("@")[0];

  const navItems = [
    { href: "/agent/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/agent/sales/new", label: "New Sale", icon: PlusCircle },
    { href: "/agent/sales", label: "My Sales", icon: TrendingUp },
    { href: "/agent/orders", label: "Territory Orders", icon: ShoppingBag },
  ];

  return (
    <div className="flex min-h-screen bg-obsidian-950">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-obsidian-950 border-r border-gold-500/15">
        <div className="p-4 border-b border-gold-500/15">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gold-500 rounded-sm flex items-center justify-center">
              <span className="text-obsidian-900 font-display font-black text-xs">M</span>
            </div>
            <span className="font-display font-bold text-gold-500 text-sm tracking-wider">MUFASA</span>
          </Link>
          <div className="mt-3">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">Agent Portal</p>
          </div>
        </div>

        <div className="p-4 border-b border-gold-500/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
              <span className="text-orange-400 font-bold text-sm">{displayName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-obsidian-100 text-sm font-medium truncate">{displayName}</p>
              <p className="text-obsidian-500 text-xs">{agentProfile?.town ?? "No territory"}</p>
            </div>
          </div>
          {agentProfile && (
            <div className="mt-3 bg-obsidian-800 rounded-lg p-2.5">
              <p className="text-obsidian-500 text-xs">Wallet Balance</p>
              <p className="text-gold-400 font-bold text-lg">${agentProfile.wallet_balance.toFixed(2)}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-obsidian-300 hover:text-white hover:bg-obsidian-800 transition-all"
            >
              <Icon size={16} className="text-obsidian-400" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gold-500/10">
          <form action="/api/auth/signout" method="post">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-obsidian-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
              <LogOut size={16} /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
