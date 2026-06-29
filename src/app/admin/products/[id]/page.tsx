import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/roles";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Role } from "@/types";

export const metadata = { title: "Edit Product | MUFASA Admin" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) redirect("/auth/login");

  const db = createAdminClient();
  const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !hasPermission(profile.role as Role, "products:update")) {
    redirect("/admin/dashboard");
  }

  const [{ data: product }, { data: categories }] = await Promise.all([
    db
      .from("products")
      .select("*, images:product_images(*), category:categories(*)")
      .eq("id", id)
      .single(),
    db.from("categories").select("*").order("sort_order"),
  ]);

  if (!product) notFound();

  return <ProductForm product={product as never} categories={categories ?? []} />;
}
