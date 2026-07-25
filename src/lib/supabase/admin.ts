import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * Service-role Supabase client for storage / privileged writes.
 * Throws a clear error when SUPABASE_SERVICE_ROLE_KEY is missing and required.
 */
export async function createAdminClient(options?: { required?: boolean }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && serviceKey) {
    return createSupabaseClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  if (options?.required !== false && !serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. Set it in the environment for media uploads and privileged storage operations."
    );
  }

  // Fallback: cookie session client (may fail RLS / storage policies).
  return createServerClient();
}
