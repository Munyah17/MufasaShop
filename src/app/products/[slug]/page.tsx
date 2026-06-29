import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { ProductDetail } from "@/components/shop/ProductDetail";
import type { Product } from "@/types";

// Serve cached HTML for 5 minutes; background revalidate keeps it fresh
export const revalidate = 300;

async function getProduct(slug: string): Promise<Product | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(*), images:product_images(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return (data as Product) ?? null;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found | MUFASA Gadgets" };
  return {
    title: `${product.name} | MUFASA Gadgets`,
    description: product.short_description ?? product.description?.slice(0, 160),
  };
}

export default async function ProductPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
