import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/roles";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Role } from "@/types";

export const metadata = { title: "New Product | MUFASA Admin" };

export default async function NewProductPage() {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) redirect("/auth/login");

  const db = createAdminClient();
  const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !hasPermission(profile.role as Role, "products:create")) {
    redirect("/admin/dashboard");
  }

  const { data: categories } = await db.from("categories").select("*").order("sort_order");

  return <ProductForm categories={categories ?? []} />;
}
