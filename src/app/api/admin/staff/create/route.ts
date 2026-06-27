import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { hasPermission, ADMIN_ROLES } from "@/lib/roles";
import type { Role } from "@/types";

// Roles that each role is allowed to create
const CREATABLE_BY: Record<Role, Role[]> = {
  super_admin: ["admin", "supervisor", "assistant", "investor", "agent", "delivery"],
  admin:       ["supervisor", "assistant", "investor", "agent", "delivery"],
  supervisor:  [], assistant: [], investor: [], agent: [], delivery: [], customer: [],
};

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

    const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (!me || !hasPermission(me.role as Role, "staff:create")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const { full_name, email, password, role, phone, username } = body;

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Email, password and role are required" }, { status: 400 });
    }

    const allowed = CREATABLE_BY[me.role as Role] ?? [];
    if (!allowed.includes(role as Role)) {
      return NextResponse.json({ error: `You cannot create a ${role} account` }, { status: 403 });
    }

    // Create auth user using service role (admin client)
    const admin = createAdminClient();
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

    // Update profile with all fields (trigger creates basic profile on signup)
    await admin.from("profiles").update({
      full_name: full_name ?? null,
      username: username ?? null,
      phone: phone ?? null,
      role,
      created_by: user.id,
      status: "active",
    }).eq("id", authData.id);

    // If agent, create agent_profiles entry
    if (role === "agent") {
      await admin.from("agent_profiles").insert({
        id: authData.id,
        territory: "To be assigned",
        town: "To be assigned",
        markup_percentage: 20,
        max_markup_percentage: 50,
      });
    }

    // If delivery, create delivery_profiles entry
    if (role === "delivery") {
      await admin.from("delivery_profiles").insert({
        id: authData.id,
        vehicle_type: "bike",
      });
    }

    return NextResponse.json({ success: true, id: authData.id });
  } catch (err) {
    console.error("[staff/create]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
