import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  FALLBACK_CMS_PAGES,
  FALLBACK_CMS_SECTIONS,
  FALLBACK_SHIPPING_ZONES,
} from "@/lib/cms/fallback-content";
import type { CmsPage, CmsSection, ShippingZone, StoreSettings } from "@/types/erp";

export async function getCmsPage(slug: string): Promise<CmsPage | null> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_CMS_PAGES.find((p) => p.slug === slug && p.is_published) ?? null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cms_pages")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error || !data) {
      return FALLBACK_CMS_PAGES.find((p) => p.slug === slug && p.is_published) ?? null;
    }
    return data as CmsPage;
  } catch {
    return FALLBACK_CMS_PAGES.find((p) => p.slug === slug && p.is_published) ?? null;
  }
}

export async function getCmsPageAdmin(slug: string): Promise<CmsPage | null> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_CMS_PAGES.find((p) => p.slug === slug) ?? null;
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("cms_pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (data as CmsPage) ?? null;
}

export async function listCmsPages(opts?: {
  publishedOnly?: boolean;
  prefix?: string;
}): Promise<CmsPage[]> {
  const publishedOnly = opts?.publishedOnly ?? true;
  const prefix = opts?.prefix;

  if (!isSupabaseConfigured()) {
    return FALLBACK_CMS_PAGES.filter((p) => {
      if (publishedOnly && !p.is_published) return false;
      if (prefix && !p.slug.startsWith(prefix)) return false;
      return true;
    }).sort((a, b) => a.sort_order - b.sort_order);
  }

  try {
    const supabase = await createClient();
    let query = supabase.from("cms_pages").select("*").order("sort_order");
    if (publishedOnly) query = query.eq("is_published", true);
    if (prefix) query = query.like("slug", `${prefix}%`);
    const { data, error } = await query;
    if (error || !data?.length) {
      return FALLBACK_CMS_PAGES.filter((p) => {
        if (publishedOnly && !p.is_published) return false;
        if (prefix && !p.slug.startsWith(prefix)) return false;
        return true;
      }).sort((a, b) => a.sort_order - b.sort_order);
    }
    return data as CmsPage[];
  } catch {
    return FALLBACK_CMS_PAGES.filter((p) => {
      if (publishedOnly && !p.is_published) return false;
      if (prefix && !p.slug.startsWith(prefix)) return false;
      return true;
    }).sort((a, b) => a.sort_order - b.sort_order);
  }
}

export async function listAboutChildren(): Promise<CmsPage[]> {
  const pages = await listCmsPages({ publishedOnly: true, prefix: "about/" });
  return pages.filter((p) => p.slug !== "about");
}

export async function getCmsSections(
  keyPrefix?: string
): Promise<Record<string, string>> {
  let sections: CmsSection[] = FALLBACK_CMS_SECTIONS;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("cms_sections")
        .select("*")
        .eq("is_published", true)
        .order("sort_order");
      if (keyPrefix) query = query.like("key", `${keyPrefix}%`);
      const { data, error } = await query;
      if (!error && data?.length) sections = data as CmsSection[];
    } catch {
      /* fallback */
    }
  }

  const map: Record<string, string> = {};
  for (const s of sections) {
    if (keyPrefix && !s.key.startsWith(keyPrefix)) continue;
    map[s.key] = s.value_text ?? s.value_md ?? "";
  }
  return map;
}

export async function listCmsSectionsAdmin(): Promise<CmsSection[]> {
  if (!isSupabaseConfigured()) return FALLBACK_CMS_SECTIONS;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cms_sections")
    .select("*")
    .order("sort_order");
  if (error || !data?.length) return FALLBACK_CMS_SECTIONS;
  return data as CmsSection[];
}

export async function listShippingZones(): Promise<ShippingZone[]> {
  if (!isSupabaseConfigured()) return FALLBACK_SHIPPING_ZONES;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("shipping_zones")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error || !data?.length) return FALLBACK_SHIPPING_ZONES;
    return data as ShippingZone[];
  } catch {
    return FALLBACK_SHIPPING_ZONES;
  }
}

export async function getStoreSettingsPublic(): Promise<Partial<StoreSettings>> {
  const defaults: Partial<StoreSettings> = {
    store_name: "DSB Books",
    address_line1: "Jojo's Shopping Complex, Chang Lam",
    city: "Thimphu",
    country: "Bhutan",
    online_checkout_enabled: false,
    btn_per_usd: 84,
    stripe_enabled: false,
  };

  if (!isSupabaseConfigured()) return defaults;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    return { ...defaults, ...(data as StoreSettings | null) };
  } catch {
    return defaults;
  }
}

export function storefrontPathForSlug(slug: string): string {
  if (slug === "about") return "/about";
  if (slug.startsWith("about/")) return `/${slug}`;
  return `/${slug}`;
}
