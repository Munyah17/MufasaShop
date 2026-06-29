import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { logError } from "@/lib/logger";
import { hasPermission } from "@/lib/roles";
import type { Role } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const auth = await createClient();
    const { data: { user } } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = createAdminClient();
    const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).single();
    if (!profile || !hasPermission(profile.role as Role, "products:create")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { images, ...productFields } = body;

    const { data: product, error } = await db
      .from("products")
      .insert(productFields)
      .select()
      .single();

    if (error || !product) {
      logError("admin/products POST — insert", error, { name: productFields.name });
      return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
    }

    if (images?.length) {
      await db.from("product_images").insert(
        images.map((img: { url: string; alt: string; is_primary: boolean }, i: number) => ({
          product_id: product.id,
          url: img.url,
          alt: img.alt || product.name,
          is_primary: i === 0 ? true : img.is_primary,
          sort_order: i,
        }))
      );
    }

    return NextResponse.json({ id: product.id });
  } catch (err) {
    logError("admin/products POST", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
