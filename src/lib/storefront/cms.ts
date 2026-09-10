import { connection } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { CmsPage, CmsPageWithSections, CmsSection } from "@/lib/storefront/cms-types";

export async function getCmsPage(
  slug: string,
  opts?: { includeDraft?: boolean }
): Promise<CmsPageWithSections | null> {
  await connection();
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    let q = supabase.from("cms_pages").select("*").eq("slug", slug);
    if (!opts?.includeDraft) q = q.eq("status", "published");
    const { data: page, error } = await q.maybeSingle();
    if (error || !page) return null;

    const { data: sections } = await supabase
      .from("cms_sections")
      .select("*")
      .eq("page_id", page.id)
      .eq("is_visible", true)
      .order("sort_order", { ascending: true });

    return {
      ...(page as CmsPage),
      sections: (sections as CmsSection[]) ?? [],
    };
  } catch {
    return null;
  }
}

export async function getCmsSection(
  slug: string,
  key: string
): Promise<CmsSection | null> {
  const page = await getCmsPage(slug);
  if (!page) return null;
  return page.sections.find((s) => s.key === key) ?? null;
}

export async function listCmsPages(): Promise<CmsPage[]> {
  await connection();
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("cms_pages")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as CmsPage[]) ?? [];
}

export async function getCmsPageById(
  id: string
): Promise<CmsPageWithSections | null> {
  await connection();
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data: page } = await supabase
    .from("cms_pages")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!page) return null;
  const { data: sections } = await supabase
    .from("cms_sections")
    .select("*")
    .eq("page_id", id)
    .order("sort_order", { ascending: true });
  return {
    ...(page as CmsPage),
    sections: (sections as CmsSection[]) ?? [],
  };
}
