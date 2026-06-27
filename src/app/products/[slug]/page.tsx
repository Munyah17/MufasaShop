"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ShoppingBag, Star, Shield, Truck, ArrowLeft, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/store/cartStore";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/types";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("shop_products")
        .select("*, category:categories(*), images:shop_product_images(*)")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();
      setProduct(data as Product | null);
      setLoading(false);
    }
    load();
  }, [slug]);

  function handleAddToCart() {
    if (!product) return;
    const primaryImage =
      product.images?.find((i) => i.is_primary)?.url ?? product.images?.[0]?.url ?? "";
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: primaryImage,
      slug: product.slug,
      stock_quantity: product.stock_quantity,
    });
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2500);
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
        <span className="text-5xl">🔍</span>
        <h2 className="font-display text-2xl text-obsidian-200">Product Not Found</h2>
        <Link href="/products">
          <Button variant="outline">Browse Products</Button>
        </Link>
      </div>
    );
  }

  const images = product.images ?? [];
  const currentImage = images[selectedImage]?.url ?? "/placeholder-product.jpg";
  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round((1 - product.price / product.compare_at_price) * 100)
      : null;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-obsidian-500 mb-8">
          <Link href="/" className="hover:text-gold-500 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gold-500 transition-colors">Products</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/products?category=${product.category.slug}`}
                className="hover:text-gold-500 transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-obsidian-300 truncate max-w-xs">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-obsidian-800 border border-obsidian-700">
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {discount && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-md">
                  -{discount}%
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === i
                        ? "border-gold-500"
                        : "border-obsidian-700 hover:border-obsidian-500"
                    }`}
                  >
                    <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">
            {product.category && (
              <p className="text-gold-600 text-xs font-semibold uppercase tracking-widest">
                {product.category.name}
              </p>
            )}

            <div>
              <h1 className="font-display font-bold text-3xl sm:text-4xl text-obsidian-50 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-gold-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <span className="text-obsidian-400 text-sm">(4.8) · 128 reviews</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-display font-bold text-4xl text-gold-500">
                ${product.price.toFixed(2)}
              </span>
              {product.compare_at_price && (
                <span className="text-obsidian-500 text-xl line-through">
                  ${product.compare_at_price.toFixed(2)}
                </span>
              )}
              {discount && (
                <span className="px-2 py-0.5 bg-red-600/20 text-red-400 text-sm font-bold rounded">
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Short description */}
            {product.short_description && (
              <p className="text-obsidian-300 leading-relaxed">{product.short_description}</p>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  product.stock_quantity > 10
                    ? "bg-green-400"
                    : product.stock_quantity > 0
                    ? "bg-yellow-400"
                    : "bg-red-500"
                }`}
              />
              <span className="text-sm text-obsidian-300">
                {product.stock_quantity > 10
                  ? "In Stock"
                  : product.stock_quantity > 0
                  ? `Only ${product.stock_quantity} left`
                  : "Out of Stock"}
              </span>
            </div>

            <div className="h-px bg-obsidian-800" />

            {/* Quantity + Add to Cart */}
            {product.stock_quantity > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-obsidian-300 text-sm font-medium">Quantity</span>
                  <div className="flex items-center border border-obsidian-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 text-obsidian-300 hover:text-gold-500 hover:bg-obsidian-800 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-5 py-2 text-obsidian-100 font-medium min-w-[3rem] text-center border-x border-obsidian-700">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity((q) => Math.min(q + 1, product.stock_quantity))
                      }
                      className="px-3 py-2 text-obsidian-300 hover:text-gold-500 hover:bg-obsidian-800 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <Button
                  variant="gold"
                  size="lg"
                  fullWidth
                  onClick={handleAddToCart}
                  className="text-base"
                >
                  <ShoppingBag size={18} />
                  {added ? "Added to Cart ✓" : "Add to Cart"}
                </Button>
                <Link href="/checkout">
                  <Button variant="outline" size="lg" fullWidth className="text-base mt-2">
                    Buy Now
                  </Button>
                </Link>
              </div>
            ) : (
              <Button variant="ghost" size="lg" fullWidth disabled>
                Out of Stock
              </Button>
            )}

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { icon: Shield, text: "Genuine product" },
                { icon: Truck, text: "Fast delivery" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 p-3 bg-obsidian-800 rounded-lg border border-obsidian-700"
                >
                  <Icon size={15} className="text-gold-500 shrink-0" />
                  <span className="text-obsidian-300 text-xs">{text}</span>
                </div>
              ))}
            </div>

            {/* Specs */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="bg-obsidian-800 rounded-xl border border-obsidian-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-obsidian-700">
                  <h3 className="font-display font-semibold text-obsidian-100 text-sm">
                    Specifications
                  </h3>
                </div>
                <div className="divide-y divide-obsidian-700">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex px-4 py-2.5 gap-4">
                      <span className="text-obsidian-500 text-xs font-medium w-28 shrink-0">
                        {key}
                      </span>
                      <span className="text-obsidian-200 text-xs flex-1">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Full Description */}
        {product.description && (
          <div className="mt-16 max-w-3xl">
            <h2 className="font-display font-bold text-2xl text-obsidian-50 mb-4">
              Product Details
            </h2>
            <div className="text-obsidian-300 leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
