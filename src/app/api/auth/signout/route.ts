import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    // Redirect back to home. Use request origin so this works on any environment
    // (localhost, Vercel preview, production) without needing NEXT_PUBLIC_APP_URL.
    const origin = req.nextUrl.origin;
    const response = NextResponse.redirect(new URL("/", origin));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
            );
          },
        },
      }
    );

    await supabase.auth.signOut();
    return response;
  } catch {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }
}
