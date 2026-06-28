"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Star } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCartStore();

  const primaryImage =
    product.images?.find((img) => img.is_primary)?.url ??
    product.images?.[0]?.url ??
    "/placeholder-product.jpg";

  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round((1 - product.price / product.compare_at_price) * 100)
      : null;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: primaryImage,
      slug: product.slug,
      stock_quantity: product.stock_quantity,
    });
    openCart();
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-obsidian-800 border border-obsidian-700 rounded-xl overflow-hidden card-hover">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-obsidian-700">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_featured && (
              <span className="px-2 py-0.5 bg-gold-500 text-obsidian-900 text-[10px] font-bold uppercase tracking-widest rounded-sm">
                Featured
              </span>
            )}
            {discount && (
              <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-sm">
                -{discount}%
              </span>
            )}
            {product.stock_quantity === 0 && (
              <span className="px-2 py-0.5 bg-obsidian-600 text-obsidian-300 text-[10px] font-bold uppercase tracking-widest rounded-sm">
                Sold Out
              </span>
            )}
          </div>

          {/* Add to cart — always visible at bottom of image */}
          {product.stock_quantity > 0 ? (
            <button
              onClick={handleAddToCart}
              className="absolute inset-x-0 bottom-0 py-2.5 bg-gold-500 text-zinc-950 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-gold-400 transition-colors duration-150"
            >
              <ShoppingBag size={13} />
              Add to Cart
            </button>
          ) : (
            <div className="absolute inset-x-0 bottom-0 py-2.5 bg-obsidian-700/80 text-obsidian-400 text-xs font-semibold flex items-center justify-center">
              Out of Stock
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          {product.category && (
            <p className="font-mono text-gold-600 text-[10px] font-semibold uppercase tracking-widest mb-1">
              {product.category.name}
            </p>
          )}
          <h3 className="text-obsidian-50 font-semibold text-sm leading-snug mb-3 line-clamp-2 group-hover:text-gold-400 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-gold-500 font-bold text-base">
                ${product.price.toFixed(2)}
              </span>
              {product.compare_at_price && (
                <span className="font-mono text-obsidian-500 text-xs line-through">
                  ${product.compare_at_price.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-gold-500">
              <Star size={12} fill="currentColor" />
              <span className="text-xs text-obsidian-400">4.8</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
