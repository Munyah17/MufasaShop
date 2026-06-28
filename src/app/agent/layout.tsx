import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, ShoppingBag, TrendingUp, PlusCircle, LogOut } from "lucide-react";
import { AgentMobileNav } from "@/components/agent/AgentMobileNav";
import icon from "@/assets/mufasa-icon.png";

export const metadata = { title: "Agent Portal | MUFASA" };

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/agent/dashboard");

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("role, full_name, username, email")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "agent") redirect("/?error=unauthorized");

  const { data: agentProfile } = await admin
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
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-obsidian-950 border-r border-gold-500/15">
        <div className="p-4 border-b border-gold-500/15">
          <Link href="/" className="flex items-center gap-2">
            <Image src={icon} alt="MUFASA" width={28} height={28} className="rounded-sm object-contain" />
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

      {/* Main content column — includes mobile top bar */}
      <div className="flex-1 flex flex-col min-w-0">
        <AgentMobileNav
          displayName={displayName}
          walletBalance={agentProfile?.wallet_balance ?? 0}
          town={agentProfile?.town ?? null}
          navItems={navItems.map((n) => ({ href: n.href, label: n.label }))}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
