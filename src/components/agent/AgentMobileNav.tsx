"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LogOut } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
}

interface Props {
  displayName: string;
  walletBalance: number;
  town: string | null;
  navItems: NavItem[];
}

export function AgentMobileNav({ displayName, walletBalance, town, navItems }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-obsidian-800 bg-obsidian-950 sticky top-0 z-20">
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 text-obsidian-400 hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <span className="font-display font-bold text-orange-400 text-sm tracking-wider uppercase">
          Agent Portal
        </span>
        <div className="ml-auto text-right">
          <p className="text-gold-400 font-bold text-sm">${walletBalance.toFixed(2)}</p>
          <p className="text-obsidian-500 text-[10px]">wallet</p>
        </div>
      </div>

      {/* Slide-over drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-64 h-full bg-obsidian-950 border-r border-gold-500/15 flex flex-col shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gold-500/15">
              <span className="font-display font-bold text-gold-500 text-sm tracking-wider uppercase">MUFASA</span>
              <button onClick={() => setOpen(false)} className="p-1 text-obsidian-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Agent info */}
            <div className="p-4 border-b border-gold-500/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <span className="text-orange-400 font-bold text-sm">{displayName.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-obsidian-100 text-sm font-medium">{displayName}</p>
                  <p className="text-obsidian-500 text-xs">{town ?? "No territory"}</p>
                </div>
              </div>
              <div className="bg-obsidian-800 rounded-lg p-2.5">
                <p className="text-obsidian-500 text-xs">Wallet Balance</p>
                <p className="text-gold-400 font-bold text-lg">${walletBalance.toFixed(2)}</p>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-0.5">
              {navItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-obsidian-300 hover:text-white hover:bg-obsidian-800 transition-all"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-gold-500/10">
              <form action="/api/auth/signout" method="post">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-obsidian-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                  <LogOut size={16} /> Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
