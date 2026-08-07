import type { MetadataRoute } from "next";
import { listCmsPages } from "@/lib/cms/get-page";
import { getSiteUrl } from "@/lib/storefront/site";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { storefrontPathForSlug } from "@/lib/cms/get-page";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: `${siteUrl}/books`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/authors`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const pages = await listCmsPages({ publishedOnly: true });
  const cmsRoutes: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${siteUrl}${storefrontPathForSlug(page.slug)}`,
    lastModified: page.updated_at ? new Date(page.updated_at) : now,
    changeFrequency: "weekly" as const,
    priority: page.slug === "about" ? 0.8 : 0.6,
  }));

  let bookRoutes: MetadataRoute.Sitemap = [];
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("books")
        .select("slug, updated_at")
        .eq("is_published", true)
        .order("updated_at", { ascending: false })
        .limit(500);
      bookRoutes = (data ?? []).map((b) => ({
        url: `${siteUrl}/books/${b.slug}`,
        lastModified: b.updated_at ? new Date(b.updated_at) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    } catch {
      bookRoutes = [];
    }
  }

  return [...staticRoutes, ...cmsRoutes, ...bookRoutes];
}
