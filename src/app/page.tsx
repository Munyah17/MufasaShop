import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Truck, RefreshCw, Star, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Product } from "@/types";

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*, category:categories(*), images:product_images(*)")
      .eq("is_featured", true)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8);
    return (data as Product[]) ?? [];
  } catch {
    return [];
  }
}

const categories = [
  { name: "Smartphones", slug: "smartphones", icon: "📱", count: "Latest Models" },
  { name: "Audio", slug: "audio", icon: "🎧", count: "Premium Sound" },
  { name: "Wearables", slug: "wearables", icon: "⌚", count: "Smart Wear" },
  { name: "Accessories", slug: "accessories", icon: "🔌", count: "Must Haves" },
  { name: "Laptops", slug: "laptops", icon: "💻", count: "Power Machines" },
  { name: "Cameras", slug: "cameras", icon: "📷", count: "Capture Moments" },
];

const perks = [
  { icon: Shield, title: "Genuine Products", desc: "100% authentic tech from verified suppliers" },
  { icon: Truck, title: "Fast Delivery", desc: "Nationwide delivery across Zimbabwe" },
  { icon: RefreshCw, title: "Easy Returns", desc: "7-day hassle-free return policy" },
  { icon: Zap, title: "Tech Support", desc: "Expert support when you need it" },
];

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-obsidian-950">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.12),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,175,55,0.06),transparent_60%)]" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "linear-gradient(rgba(212,175,55,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,0.5) 1px,transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400 text-xs font-semibold tracking-widest uppercase mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
                Premium Tech Collection 2026
              </div>

              <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-obsidian-50 leading-tight mb-6">
                Elevate Your
                <span className="block gold-shimmer mt-2">Digital Life</span>
              </h1>

              <p className="text-obsidian-300 text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8">
                Discover MUFASA&apos;s curated collection of premium gadgets and accessories.
                Where cutting-edge technology meets the elegance of luxury.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold-500 text-obsidian-900 rounded-md font-bold text-base hover:bg-gold-400 transition-all hover:shadow-lg hover:shadow-gold-500/25 active:scale-[0.98]"
                >
                  Shop Now <ArrowRight size={18} />
                </Link>
                <Link
                  href="/products?featured=true"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gold-500/40 text-gold-400 rounded-md font-semibold text-base hover:border-gold-500 hover:bg-gold-500/10 transition-all"
                >
                  <Star size={16} />
                  Featured
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 justify-center lg:justify-start mt-12">
                {[
                  { val: "500+", label: "Products" },
                  { val: "10k+", label: "Customers" },
                  { val: "4.9★", label: "Rating" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-gold-500 font-display font-bold text-2xl">{stat.val}</div>
                    <div className="text-obsidian-500 text-xs uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual — placeholder for hero product image */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative w-72 h-72 sm:w-96 sm:h-96">
                <div className="absolute inset-0 rounded-full bg-gold-500/10 blur-3xl" />
                <div className="relative w-full h-full rounded-2xl border border-gold-500/20 bg-obsidian-800/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">⚡</div>
                    <p className="font-display text-gold-500 font-semibold text-sm tracking-widest uppercase">
                      Premium Tech
                    </p>
                    <p className="text-obsidian-400 text-xs mt-1">Hero image coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Perks bar ─────────────────────────────────────────────────── */}
      <section className="bg-obsidian-800 border-y border-obsidian-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-gold-500" />
                </div>
                <div>
                  <p className="text-obsidian-100 font-semibold text-sm">{title}</p>
                  <p className="text-obsidian-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-gold-500 text-xs font-semibold uppercase tracking-[0.3em] mb-3">
            Browse by Category
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-obsidian-50">
            What are you looking for?
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center gap-3 p-5 bg-obsidian-800 border border-obsidian-700 rounded-xl hover:border-gold-500/50 hover:bg-obsidian-700 transition-all duration-300 card-hover text-center"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                {cat.icon}
              </span>
              <div>
                <p className="text-obsidian-100 font-semibold text-sm group-hover:text-gold-400 transition-colors">
                  {cat.name}
                </p>
                <p className="text-obsidian-500 text-[10px] mt-0.5">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-gold-500 text-xs font-semibold uppercase tracking-[0.3em] mb-3">
              Handpicked for You
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-obsidian-50">
              Featured Products
            </h2>
          </div>
          <Link
            href="/products?featured=true"
            className="hidden sm:flex items-center gap-2 text-gold-500 hover:text-gold-400 text-sm font-semibold transition-colors"
          >
            View All <ArrowRight size={15} />
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Placeholder cards when no products in DB yet */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-obsidian-800 border border-obsidian-700 rounded-xl overflow-hidden">
                <div className="aspect-square bg-obsidian-700 flex items-center justify-center">
                  <span className="text-4xl">📦</span>
                </div>
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-obsidian-700 rounded w-3/4" />
                  <div className="h-3 bg-obsidian-700 rounded w-1/2" />
                  <div className="h-4 bg-gold-500/20 rounded w-1/3 mt-3" />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 border border-gold-500/40 text-gold-400 rounded-md font-semibold text-sm hover:border-gold-500 hover:bg-gold-500/10 transition-all"
          >
            Browse All Products <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-obsidian-800 border-y border-obsidian-700 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.1),transparent_70%)]" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <p className="text-gold-500 text-xs font-semibold uppercase tracking-[0.3em] mb-4">
            Exclusive Membership
          </p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-obsidian-50 mb-4">
            Join the{" "}
            <span className="gold-text">MUFASA</span> Circle
          </h2>
          <p className="text-obsidian-300 text-lg mb-8 leading-relaxed">
            Get early access to new products, exclusive member pricing, and priority support.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gold-500 text-obsidian-900 rounded-md font-bold text-base hover:bg-gold-400 transition-all hover:shadow-xl hover:shadow-gold-500/25"
          >
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
