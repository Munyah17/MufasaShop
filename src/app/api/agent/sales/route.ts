import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (!profile || profile.role !== "agent") {
      return NextResponse.json({ error: "Agent access required" }, { status: 403 });
    }

    const body = await req.json();
    const { items, base_total, sale_total, agent_profit, payment_method, customer_name, customer_phone, notes } = body;

    if (!items?.length || !base_total || !sale_total) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate sale price >= base price for each item
    for (const item of items) {
      if (item.sale_price < item.base_price) {
        return NextResponse.json({ error: `Sale price for ${item.product_name} cannot be less than base price` }, { status: 400 });
      }
    }

    const admin = createAdminClient();

    // Record the sale
    const { data: sale, error } = await admin.from("agent_sales").insert({
      agent_id: user.id,
      items,
      base_total,
      sale_total,
      agent_profit,
      payment_method: payment_method ?? "cash",
      customer_name: customer_name ?? null,
      customer_phone: customer_phone ?? null,
      notes: notes ?? null,
    }).select().single();

    if (error) throw error;

    // Update agent wallet and totals
    await admin.rpc("increment_agent_totals", {
      agent_id: user.id,
      sale_amount: sale_total,
      profit_amount: agent_profit,
    }).catch(() => {
      // Fallback if RPC doesn't exist: direct update
      return admin
        .from("agent_profiles")
        .select("wallet_balance, total_sales, total_commission")
        .eq("id", user.id)
        .single()
        .then(({ data }: { data: { wallet_balance: number; total_sales: number; total_commission: number } | null }) => {
          if (data) {
            return admin.from("agent_profiles").update({
              wallet_balance: (data.wallet_balance ?? 0) + agent_profit,
              total_sales: (data.total_sales ?? 0) + sale_total,
              total_commission: (data.total_commission ?? 0) + agent_profit,
            }).eq("id", user.id);
          }
        });
    });

    return NextResponse.json({ success: true, id: sale.id });
  } catch (err) {
    console.error("[agent/sales]", err);
    return NextResponse.json({ error: "Failed to record sale" }, { status: 500 });
  }
}
