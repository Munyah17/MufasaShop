"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X, Search, User, LayoutDashboard, LogOut } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { useProfile } from "@/hooks/useProfile";
import { getDefaultPortal, ROLE_LABELS } from "@/lib/roles";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { itemCount, toggleCart } = useCartStore();
  const { profile, loading: profileLoading } = useProfile();
  const count = itemCount();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!accountOpen) return;
    const handler = () => setAccountOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [accountOpen]);

  async function handleSignOut() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const navLinks = [
    { href: "/products", label: "All Products" },
    { href: "/products?category=smartphones", label: "Smartphones" },
    { href: "/products?category=accessories", label: "Accessories" },
    { href: "/products?category=audio", label: "Audio" },
    { href: "/products?category=wearables", label: "Wearables" },
  ];

  const portalHref = profile ? getDefaultPortal(profile.role) : null;
  const displayName = profile
    ? profile.full_name || profile.username || profile.email.split("@")[0]
    : null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-obsidian-900/95 backdrop-blur-md border-b border-gold-500/20 shadow-lg shadow-black/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gold-500 rounded-sm flex items-center justify-center group-hover:bg-gold-400 transition-colors">
              <span className="text-obsidian-900 font-display font-black text-sm">M</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-gold-500 text-sm tracking-widest uppercase">
                Mufasa
              </span>
              <span className="text-obsidian-200 text-[9px] tracking-[0.2em] uppercase">
                Gadgets & Accessories
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-obsidian-200 hover:text-gold-500 text-sm font-medium tracking-wide transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gold-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button aria-label="Search" className="p-2 text-obsidian-300 hover:text-gold-500 transition-colors">
              <Search size={20} />
            </button>

            {/* Account — shows dropdown if logged in, link to login if not */}
            {!profileLoading && (
              <div className="relative">
                {profile ? (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setAccountOpen(!accountOpen); }}
                      className="flex items-center gap-1.5 p-2 text-obsidian-300 hover:text-gold-500 transition-colors"
                      aria-label="Account menu"
                    >
                      <div className="w-6 h-6 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
                        <span className="text-gold-400 text-xs font-bold">
                          {displayName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </button>

                    {accountOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-full mt-2 w-52 bg-obsidian-900 border border-obsidian-700 rounded-xl shadow-2xl overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-obsidian-800">
                          <p className="text-white text-sm font-medium truncate">{displayName}</p>
                          <p className="text-obsidian-500 text-xs mt-0.5">{ROLE_LABELS[profile.role]}</p>
                        </div>
                        <div className="py-1">
                          {portalHref && (
                            <Link
                              href={portalHref}
                              onClick={() => setAccountOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-obsidian-200 hover:text-gold-400 hover:bg-obsidian-800 transition-colors"
                            >
                              <LayoutDashboard size={15} />
                              {profile.role === "customer" ? "My Account" : "My Portal"}
                            </Link>
                          )}
                          <Link
                            href="/orders"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-obsidian-200 hover:text-gold-400 hover:bg-obsidian-800 transition-colors"
                          >
                            <ShoppingBag size={15} />
                            My Orders
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-obsidian-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <LogOut size={15} />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    aria-label="Account"
                    className="p-2 text-obsidian-300 hover:text-gold-500 transition-colors"
                  >
                    <User size={20} />
                  </Link>
                )}
              </div>
            )}

            <button
              onClick={toggleCart}
              aria-label="Open cart"
              className="relative p-2 text-obsidian-300 hover:text-gold-500 transition-colors"
            >
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gold-500 text-obsidian-900 rounded-full text-[10px] font-bold flex items-center justify-center">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-obsidian-300 hover:text-gold-500 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-obsidian-800/98 backdrop-blur-md border-b border-gold-500/20">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-3 text-obsidian-100 hover:text-gold-500 hover:bg-obsidian-700 rounded-md text-sm font-medium tracking-wide transition-all"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-obsidian-700 mt-2 pt-2 space-y-1">
              {profile ? (
                <>
                  <div className="px-3 py-2">
                    <p className="text-obsidian-300 text-sm font-medium">{displayName}</p>
                    <p className="text-obsidian-500 text-xs">{ROLE_LABELS[profile.role]}</p>
                  </div>
                  {portalHref && (
                    <Link
                      href={portalHref}
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-3 text-obsidian-100 hover:text-gold-500 hover:bg-obsidian-700 rounded-md text-sm font-medium transition-all flex items-center gap-2"
                    >
                      <LayoutDashboard size={16} /> My Portal
                    </Link>
                  )}
                  <button
                    onClick={() => { handleSignOut(); setMobileOpen(false); }}
                    className="w-full px-3 py-3 text-rose-400 hover:bg-rose-500/10 rounded-md text-sm font-medium transition-all flex items-center gap-2"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-3 text-obsidian-100 hover:text-gold-500 hover:bg-obsidian-700 rounded-md text-sm font-medium tracking-wide transition-all flex items-center gap-2"
                >
                  <User size={16} /> Sign In / Register
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
