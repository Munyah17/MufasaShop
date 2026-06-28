import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Truck, LayoutDashboard, Package, History, LogOut } from "lucide-react";
import icon from "@/assets/mufasa-icon.png";

export const metadata = { title: "Delivery Portal | MUFASA" };

export default async function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/delivery/dashboard");

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("role, full_name, username, email")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "delivery") redirect("/?error=unauthorized");

  const { data: deliveryProfile } = await admin
    .from("delivery_profiles")
    .select("vehicle_type, zone, is_available, total_deliveries, total_earnings")
    .eq("id", user.id)
    .single();

  const displayName = profile.full_name || profile.username || profile.email.split("@")[0];
  const VEHICLE_ICON: Record<string, string> = { bike: "🏍️", car: "🚗", truck: "🚚", walk: "🚶" };

  const navItems = [
    { href: "/delivery/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/delivery/assigned", label: "My Deliveries", icon: Package },
    { href: "/delivery/history", label: "History", icon: History },
  ];

  return (
    <div className="flex min-h-screen bg-obsidian-950">
      <aside className="hidden lg:flex flex-col w-60 bg-obsidian-950 border-r border-gold-500/15">
        <div className="p-4 border-b border-gold-500/15">
          <Link href="/" className="flex items-center gap-2">
            <Image src={icon} alt="MUFASA" width={28} height={28} className="rounded-sm object-contain" />
            <span className="font-display font-bold text-gold-500 text-sm tracking-wider">MUFASA</span>
          </Link>
          <p className="text-xs font-bold text-rose-400 uppercase tracking-wider mt-3">Delivery Portal</p>
        </div>

        <div className="p-4 border-b border-gold-500/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-lg">
              {VEHICLE_ICON[deliveryProfile?.vehicle_type ?? "bike"]}
            </div>
            <div className="min-w-0">
              <p className="text-obsidian-100 text-sm font-medium truncate">{displayName}</p>
              <p className="text-obsidian-500 text-xs">{deliveryProfile?.zone ?? "No zone"}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="bg-obsidian-800 rounded-lg p-2 text-center">
              <p className="text-obsidian-500 text-xs">Trips</p>
              <p className="text-white font-bold">{deliveryProfile?.total_deliveries ?? 0}</p>
            </div>
            <div className="bg-obsidian-800 rounded-lg p-2 text-center">
              <p className="text-obsidian-500 text-xs">Earned</p>
              <p className="text-gold-400 font-bold">${(deliveryProfile?.total_earnings ?? 0).toFixed(0)}</p>
            </div>
          </div>
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
