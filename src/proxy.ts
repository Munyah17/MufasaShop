import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_REQUIRED = ["/admin", "/agent", "/delivery", "/account"];
const AUTH_PAGES    = ["/auth/login", "/auth/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = AUTH_REQUIRED.some((p) => pathname.startsWith(p));
  const isAuthPage  = AUTH_PAGES.some((p) => pathname === p);

  // Inject pathname into REQUEST headers so server components can read it
  // via headers().get("x-pathname"). Must be on the request, not the response.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  if (!isProtected && !isAuthPage) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  try {
    // Start with our patched request headers so server components get x-pathname
    let response = NextResponse.next({ request: { headers: requestHeaders } });

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          );
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();

    if (!user && isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    if (user && isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }

    return response;
  } catch {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
