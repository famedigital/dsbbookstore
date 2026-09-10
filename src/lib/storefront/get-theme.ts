import { connection } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  DEFAULT_STOREFRONT_THEME,
  resolveStorefrontTheme,
  type StorefrontThemeId,
} from "@/lib/storefront/themes";

/** Live theme from Settings — never serve a stale cached template. */
export async function getStorefrontTheme(): Promise<StorefrontThemeId> {
  await connection();
  if (!isSupabaseConfigured()) return DEFAULT_STOREFRONT_THEME;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("store_settings")
      .select("storefront_theme")
      .eq("id", 1)
      .maybeSingle();
    return resolveStorefrontTheme(
      (data as { storefront_theme?: string } | null)?.storefront_theme,
    );
  } catch {
    return DEFAULT_STOREFRONT_THEME;
  }
}
