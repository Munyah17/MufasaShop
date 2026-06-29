import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { logError } from "@/lib/logger";
import { hasPermission } from "@/lib/roles";
import type { Permission } from "@/lib/roles";
import type { Role } from "@/types";

async function getAuthedAdmin(requiredPermission: Permission) {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return null;
  const db = createAdminClient();
  const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !hasPermission(profile.role as Role, requiredPermission)) return null;
  return db;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const db = await getAuthedAdmin("products:update");
    if (!db) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { images, ...productFields } = body;

    const { error } = await db
      .from("products")
      .update({ ...productFields, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      logError("admin/products PATCH — update", error, { id });
      return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
    }

    // Replace images: delete existing, insert new
    if (images !== undefined) {
      await db.from("product_images").delete().eq("product_id", id);
      if (images.length > 0) {
        await db.from("product_images").insert(
          images.map((img: { url: string; alt: string; is_primary: boolean }, i: number) => ({
            product_id: id,
            url: img.url,
            alt: img.alt || "",
            is_primary: i === 0 ? true : img.is_primary,
            sort_order: i,
          }))
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logError("admin/products PATCH", err, { id });
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const db = await getAuthedAdmin("products:delete");
    if (!db) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await db.from("product_images").delete().eq("product_id", id);
    const { error } = await db.from("products").delete().eq("id", id);

    if (error) {
      logError("admin/products DELETE", error, { id });
      return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logError("admin/products DELETE", err, { id });
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
