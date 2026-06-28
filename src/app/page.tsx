import Link from "next/link";
import { ArrowRight, Shield, Truck, RefreshCw, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Product } from "@/types";

const PRODUCT_SELECT = "*, category:categories(*), images:product_images(*)";

async function getFeatured(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("products").select(PRODUCT_SELECT)
      .eq("is_featured", true).eq("is_active", true)
      .order("created_at", { ascending: false }).limit(8);
    return (data as Product[]) ?? [];
  } catch { return []; }
}

async function getPremium(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("products").select(PRODUCT_SELECT)
      .gte("price", 50).eq("is_active", true)
      .order("price", { ascending: false }).limit(8);
    return (data as Product[]) ?? [];
  } catch { return []; }
}

async function getBestsellers(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("products").select(PRODUCT_SELECT)
      .contains("tags", ["bestseller"]).eq("is_active", true).limit(8);
    return (data as Product[]) ?? [];
  } catch { return []; }
}

async function getHighTech(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("products").select(PRODUCT_SELECT)
      .contains("tags", ["hightech"]).eq("is_active", true).limit(8);
    return (data as Product[]) ?? [];
  } catch { return []; }
}

async function getAccessories(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("products").select(PRODUCT_SELECT)
      .contains("tags", ["accessories"]).eq("is_active", true).limit(8);
    return (data as Product[]) ?? [];
  } catch { return []; }
}

const categories = [
  { name: "Audio", slug: "audio", icon: "🎧", count: "Earbuds & Headphones" },
  { name: "Tablets", slug: "tablets", icon: "📱", count: "Android Tablets" },
  { name: "Wearables", slug: "wearables", icon: "⌚", count: "Smartwatches" },
  { name: "Accessories", slug: "accessories", icon: "🔌", count: "Cables & Chargers" },
  { name: "Electronics", slug: "electronics", icon: "⚡", count: "Drones & Printers" },
  { name: "Smart Home", slug: "smart-home", icon: "🏠", count: "Smart Devices" },
];

const perks = [
  { icon: Shield, title: "Genuine Products", desc: "100% authentic tech from verified suppliers" },
  { icon: Truck, title: "Fast Delivery", desc: "Nationwide delivery across Zimbabwe" },
  { icon: RefreshCw, title: "Easy Returns", desc: "7-day hassle-free return policy" },
  { icon: Zap, title: "Tech Support", desc: "Expert support when you need it" },
];

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-obsidian-800 border border-obsidian-700 rounded-xl overflow-hidden animate-pulse">
          <div className="aspect-square bg-obsidian-700" />
          <div className="p-4 space-y-2">
            <div className="h-3 bg-obsidian-700 rounded w-3/4" />
            <div className="h-3 bg-obsidian-700 rounded w-1/2" />
            <div className="h-4 bg-obsidian-700 rounded w-1/3 mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductSection({
  title, subtitle, products, viewAllHref,
}: {
  title: string;
  subtitle: string;
  products: Product[];
  viewAllHref: string;
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="flex items-end justify-between mb-8 sm:mb-10">
        <div>
          <p className="text-gold-500 text-[11px] font-semibold uppercase tracking-[0.25em] mb-2">
            {subtitle}
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-obsidian-50 leading-tight">
            {title}
          </h2>
        </div>
        <Link
          href={viewAllHref}
          className="hidden sm:flex items-center gap-1.5 text-gold-500 hover:text-gold-400 text-sm font-semibold transition-colors shrink-0 ml-4"
        >
          View All <ArrowRight size={14} />
        </Link>
      </div>

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="flex justify-center mt-6 sm:hidden">
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-1.5 text-gold-500 text-sm font-semibold"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
        </>
      ) : (
        <SkeletonGrid />
      )}
    </section>
  );
}

export const revalidate = 3600;

export default async function HomePage() {
  const [featured, premium, bestsellers, hightech, accessories] = await Promise.all([
    getFeatured(),
    getPremium(),
    getBestsellers(),
    getHighTech(),
    getAccessories(),
  ]);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-obsidian-950">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_70%_-10%,rgba(212,175,55,0.14),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_50%_at_10%_110%,rgba(212,175,55,0.07),transparent)]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(212,175,55,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,0.8) 1px,transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            {/* Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold-500/25 bg-gold-500/8 text-gold-400 text-[11px] font-semibold tracking-[0.2em] uppercase mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
                Premium Tech Collection 2026
              </div>

              <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl text-obsidian-50 leading-[1.05] tracking-tight mb-6">
                Elevate Your
                <span className="block gold-shimmer mt-1">Digital Life</span>
              </h1>

              <p className="text-obsidian-400 text-base sm:text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed mb-8">
                MUFASA&apos;s curated collection of premium gadgets and accessories — where cutting-edge technology meets exceptional value.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gold-500 text-obsidian-900 rounded-lg font-semibold text-sm hover:bg-gold-400 transition-all hover:shadow-lg hover:shadow-gold-500/20 active:scale-[0.98]"
                >
                  Shop Now <ArrowRight size={16} />
                </Link>
                <Link
                  href="/products?featured=true"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-obsidian-700 text-obsidian-200 rounded-lg font-semibold text-sm hover:border-gold-500/50 hover:text-gold-400 transition-all"
                >
                  Browse Featured
                </Link>
              </div>

              <div className="flex gap-8 justify-center lg:justify-start mt-12 pt-8 border-t border-obsidian-800">
                {[
                  { val: "50+", label: "Products" },
                  { val: "ZW", label: "Nationwide" },
                  { val: "100%", label: "Authentic" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="font-display font-bold text-xl text-obsidian-50">{stat.val}</div>
                    <div className="text-obsidian-500 text-xs uppercase tracking-[0.15em] mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
                <div className="absolute inset-0 rounded-full bg-gold-500/8 blur-3xl" />
                <div className="relative w-full h-full rounded-2xl border border-obsidian-700 bg-obsidian-900/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-4">⚡</div>
                    <p className="font-display font-bold text-gold-500 text-sm tracking-[0.2em] uppercase">
                      Premium Tech
                    </p>
                    <p className="text-obsidian-500 text-xs mt-1">Zimbabwe&apos;s finest gadgets</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Perks bar ─────────────────────────────────────────────── */}
      <section className="bg-obsidian-900 border-y border-obsidian-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {perks.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-obsidian-800 border border-obsidian-700 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-gold-500" />
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

      {/* ── Categories ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="mb-10">
          <p className="text-gold-500 text-[11px] font-semibold uppercase tracking-[0.25em] mb-2">
            Browse by Category
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-obsidian-50">
            What are you looking for?
          </h2>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center gap-2.5 p-4 bg-obsidian-900 border border-obsidian-800 rounded-xl hover:border-gold-500/40 hover:bg-obsidian-800 transition-all duration-200 text-center card-hover"
            >
              <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-200">
                {cat.icon}
              </span>
              <div>
                <p className="text-obsidian-200 font-semibold text-xs sm:text-sm group-hover:text-gold-400 transition-colors">
                  {cat.name}
                </p>
                <p className="text-obsidian-500 text-[10px] mt-0.5 hidden sm:block">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Section 1: Featured Products ──────────────────────────── */}
      <ProductSection
        title="Featured Products"
        subtitle="Handpicked for You"
        products={featured}
        viewAllHref="/products?featured=true"
      />

      {/* ── Section 2: Premium Products ───────────────────────────── */}
      <ProductSection
        title="Premium Products"
        subtitle="Top of the Line"
        products={premium}
        viewAllHref="/products?sort=price_desc"
      />

      {/* ── Section 3: Most Selling ───────────────────────────────── */}
      <ProductSection
        title="Most Selling Products"
        subtitle="Customer Favourites"
        products={bestsellers}
        viewAllHref="/products"
      />

      {/* ── Section 4: High Tech ──────────────────────────────────── */}
      <ProductSection
        title="High Tech Products"
        subtitle="Cutting-Edge Technology"
        products={hightech}
        viewAllHref="/products"
      />

      {/* ── Section 5: Assorted Accessories ──────────────────────── */}
      <ProductSection
        title="Assorted Accessories"
        subtitle="Essential Add-Ons"
        products={accessories}
        viewAllHref="/products?category=accessories"
      />

      {/* ── CTA Banner ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-obsidian-800 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.07),transparent_70%)]" />
        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <p className="text-gold-500 text-[11px] font-semibold uppercase tracking-[0.25em] mb-4">
            Join MUFASA
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-obsidian-50 mb-4 leading-tight tracking-tight">
            Get exclusive{" "}
            <span className="gold-text">member pricing</span>
          </h2>
          <p className="text-obsidian-400 text-base mb-8 leading-relaxed">
            Create a free account for early access to new products, member-only deals, and priority support.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold-500 text-obsidian-900 rounded-lg font-semibold text-sm hover:bg-gold-400 transition-all hover:shadow-xl hover:shadow-gold-500/20"
          >
            Create Free Account <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
