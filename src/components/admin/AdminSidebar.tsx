"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Package, Users, MapPin,
  Truck, Store, BarChart3, Settings, LogOut, ChevronLeft,
  X
} from "lucide-react";
import { hasPermission, ROLE_LABELS, ROLE_COLORS, ADMIN_NAV } from "@/lib/roles";
import type { Profile } from "@/types";

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  LayoutDashboard, ShoppingBag, Package, Users,
  MapPin, Truck, Store, BarChart3, Settings,
};

interface AdminSidebarProps {
  profile: Pick<Profile, "full_name" | "email" | "role" | "username">;
  onClose?: () => void;
}

export function AdminSidebar({ profile, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = ADMIN_NAV.filter((item) =>
    !item.permission || hasPermission(profile.role, item.permission)
  );

  const displayName = profile.full_name || profile.username || profile.email.split("@")[0];
  const roleLabel = ROLE_LABELS[profile.role];
  const roleBadge = ROLE_COLORS[profile.role];

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-obsidian-950 border-r border-gold-500/15">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gold-500/15">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-gold-500 rounded-sm flex items-center justify-center group-hover:bg-gold-400 transition-colors">
            <span className="text-obsidian-900 font-display font-black text-xs">M</span>
          </div>
          <span className="font-display font-bold text-gold-500 text-sm tracking-wider uppercase">
            Mufasa
          </span>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-1 text-obsidian-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-gold-500/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-gold-400 font-bold text-sm">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-obsidian-100 text-sm font-medium truncate">{displayName}</p>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${roleBadge}`}>
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = ICON_MAP[item.icon];
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/25"
                  : "text-obsidian-300 hover:text-obsidian-100 hover:bg-obsidian-800"
              }`}
            >
              {Icon && <Icon size={16} className={isActive ? "text-gold-400" : "text-obsidian-400"} />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gold-500/10 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-obsidian-400 hover:text-obsidian-200 hover:bg-obsidian-800 transition-all"
        >
          <ChevronLeft size={16} />
          Back to Shop
        </Link>
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-obsidian-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
