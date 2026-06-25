"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X, Search, User } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount, toggleCart } = useCartStore();
  const count = itemCount();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/products", label: "All Products" },
    { href: "/products?category=smartphones", label: "Smartphones" },
    { href: "/products?category=accessories", label: "Accessories" },
    { href: "/products?category=audio", label: "Audio" },
    { href: "/products?category=wearables", label: "Wearables" },
  ];

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
            <button
              aria-label="Search"
              className="p-2 text-obsidian-300 hover:text-gold-500 transition-colors"
            >
              <Search size={20} />
            </button>

            <Link
              href="/auth/login"
              aria-label="Account"
              className="p-2 text-obsidian-300 hover:text-gold-500 transition-colors"
            >
              <User size={20} />
            </Link>

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
            <div className="border-t border-obsidian-700 mt-2 pt-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-3 text-obsidian-100 hover:text-gold-500 hover:bg-obsidian-700 rounded-md text-sm font-medium tracking-wide transition-all flex items-center gap-2"
              >
                <User size={16} /> My Account
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
