import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { STAFF_ROLES } from "@/types/erp";
import type { UserRole } from "@/types/erp";

async function getStaffProfile(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.is_active) return null;
  if (!STAFF_ROLES.includes(profile.role as UserRole)) return null;
  return profile;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isErp = path.startsWith("/erp");
  const isLogin = path === "/erp/login";

  if (isErp && !isLogin && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/erp/login";
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  if (isErp && !isLogin && user) {
    const profile = await getStaffProfile(supabase, user.id);
    if (!profile) {
      await supabase.auth.signOut();
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/erp/login";
      redirectUrl.searchParams.set("error", "not_staff");
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isLogin && user) {
    const profile = await getStaffProfile(supabase, user.id);
    if (profile) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/erp";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}
