import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/roles";
import type { Role } from "@/types";

const CREATABLE_BY: Record<Role, Role[]> = {
  super_admin: ["admin", "supervisor", "assistant", "investor", "agent", "delivery"],
  admin:       ["supervisor", "assistant", "investor", "agent", "delivery"],
  supervisor:  [], assistant: [], investor: [], agent: [], delivery: [], customer: [],
};

const CreateStaffSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "supervisor", "assistant", "investor", "agent", "delivery"]),
  full_name: z.string().min(1).max(200).optional(),
  username: z.string().min(2).max(50).regex(/^[a-zA-Z0-9_]+$/, "Username: letters, numbers, underscores only").optional(),
  phone: z.string().max(20).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();

    const { data: me } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!me || !hasPermission(me.role as Role, "staff:create")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const rawBody = await req.json();
    const parsed = CreateStaffSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }

    const { email, password, role, full_name, username, phone } = parsed.data;

    const allowed = CREATABLE_BY[me.role as Role] ?? [];
    if (!allowed.includes(role as Role)) {
      return NextResponse.json({ error: `You cannot create a ${role} account` }, { status: 403 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        app_metadata: { role },
        user_metadata: { full_name: full_name ?? "", username: username ?? "" },
      }),
    });

    const authData = await authRes.json();
    if (!authRes.ok) {
      return NextResponse.json({ error: authData.message ?? "Failed to create user" }, { status: 400 });
    }

    await admin.from("profiles").update({
      full_name: full_name ?? null,
      username: username ?? null,
      phone: phone ?? null,
      role,
      created_by: user.id,
      status: "active",
    }).eq("id", authData.id);

    if (role === "agent") {
      await admin.from("agent_profiles").insert({
        id: authData.id,
        territory: "To be assigned",
        town: "To be assigned",
        markup_percentage: 20,
        max_markup_percentage: 50,
      });
    }

    if (role === "delivery") {
      await admin.from("delivery_profiles").insert({
        id: authData.id,
        vehicle_type: "bike",
      });
    }

    return NextResponse.json({ success: true, id: authData.id });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
