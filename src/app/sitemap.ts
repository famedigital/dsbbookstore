import type { MetadataRoute } from "next";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/books",
    "/authors",
    "/enquiry",
    "/visit",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/books" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/books" ? 0.9 : 0.6,
  }));

  if (!isSupabaseConfigured()) {
    return staticRoutes;
  }

  try {
    const supabase = await createClient();
    const { data: books } = await supabase
      .from("books")
      .select("slug, updated_at")
      .eq("is_published", true)
      .order("updated_at", { ascending: false })
      .limit(500);

    const bookRoutes: MetadataRoute.Sitemap = (books ?? []).map((book) => ({
      url: `${base}/books/${book.slug}`,
      lastModified: book.updated_at ? new Date(book.updated_at) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...bookRoutes];
  } catch {
    return staticRoutes;
  }
}
