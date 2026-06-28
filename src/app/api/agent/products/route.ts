import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/** GET /api/agent/products
 *  Returns the active product catalogue and the calling agent's markup %.
 *  Auth: agent role required.
 *  Data access: service_role (bypasses RLS).
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();

    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "agent") {
      return NextResponse.json({ error: "Agent access required" }, { status: 403 });
    }

    const [productsRes, agentRes] = await Promise.all([
      admin
        .from("products")
        .select("id, name, price, stock_quantity")
        .eq("is_active", true)
        .gt("stock_quantity", 0)
        .order("name"),
      admin
        .from("agent_profiles")
        .select("markup_percentage")
        .eq("id", user.id)
        .single(),
    ]);

    return NextResponse.json({
      products: productsRes.data ?? [],
      markup_percentage: agentRes.data?.markup_percentage ?? 20,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
