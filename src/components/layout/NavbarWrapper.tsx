import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Navbar } from "./Navbar";
import type { Profile } from "@/types";

export async function NavbarWrapper() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <Navbar profile={null} />;

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id, full_name, username, email, role, avatar_url")
      .eq("id", user.id)
      .single();

    return <Navbar profile={(profile as Profile) ?? null} />;
  } catch {
    return <Navbar profile={null} />;
  }
}
