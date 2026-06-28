import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const SaleItemSchema = z.object({
  product_id: z.string().uuid(),
  product_name: z.string().min(1).max(200),
  base_price: z.number().positive(),
  sale_price: z.number().positive(),
  quantity: z.number().int().min(1).max(9999),
  subtotal: z.number().positive(),
});

const CreateSaleSchema = z.object({
  items: z.array(SaleItemSchema).min(1, "At least one item required"),
  base_total: z.number().positive(),
  sale_total: z.number().positive(),
  agent_profit: z.number(),
  payment_method: z.enum(["cash", "ecocash", "bank_transfer", "innbucks", "other"]).default("cash"),
  customer_name: z.string().max(200).nullable().optional(),
  customer_phone: z.string().max(20).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export async function POST(req: NextRequest) {
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

    const rawBody = await req.json();
    const parsed = CreateSaleSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }

    const { items, base_total, sale_total, agent_profit, payment_method, customer_name, customer_phone, notes } = parsed.data;

    for (const item of items) {
      if (item.sale_price < item.base_price) {
        return NextResponse.json(
          { error: `Sale price for "${item.product_name}" cannot be less than base price` },
          { status: 400 }
        );
      }
    }

    const { data: sale, error } = await admin
      .from("agent_sales")
      .insert({
        agent_id: user.id,
        items,
        base_total,
        sale_total,
        agent_profit,
        payment_method,
        customer_name: customer_name ?? null,
        customer_phone: customer_phone ?? null,
        notes: notes ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    // Try RPC first; fall back to manual update if the function doesn't exist yet.
    const { error: rpcErr } = await admin.rpc("increment_agent_totals", {
      agent_id: user.id,
      sale_amount: sale_total,
      profit_amount: agent_profit,
    });

    if (rpcErr) {
      const { data: ap } = await admin
        .from("agent_profiles")
        .select("wallet_balance, total_sales, total_commission")
        .eq("id", user.id)
        .single();

      if (ap) {
        await admin.from("agent_profiles").update({
          wallet_balance: (ap.wallet_balance ?? 0) + agent_profit,
          total_sales: (ap.total_sales ?? 0) + sale_total,
          total_commission: (ap.total_commission ?? 0) + agent_profit,
        }).eq("id", user.id);
      }
    }

    return NextResponse.json({ success: true, id: sale.id });
  } catch {
    return NextResponse.json({ error: "Failed to record sale" }, { status: 500 });
  }
}
