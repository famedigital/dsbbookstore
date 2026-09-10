import type { Metadata } from "next";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { StorefrontShell } from "@/components/storefront/shell";
import { JsonLd } from "@/components/storefront/json-ld";
import { CatalogueFilterBar } from "@/components/storefront/catalogue-filters";
import { CatalogueResults } from "@/components/storefront/catalogue-results";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";
import {
  booksCollectionJsonLd,
  faqJsonLd,
  localBusinessJsonLd,
  SITE_URL,
} from "@/lib/storefront/seo";
import {
  CATALOGUE_PAGE_SIZE,
  fetchCataloguePage,
  resolveCatalogueSort,
  type CatalogueBook,
} from "@/lib/storefront/catalogue-query";
import type { Book } from "@/types/erp";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}): Promise<Metadata> {
  const { q, category, page } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);
  let title = "Buy Books in Thimphu";
  let description =
    "Browse thousands of titles at DSB Books on Chang Lam — live stock, Nu. prices, pickup in Thimphu.";

  if (q?.trim()) {
    title = `Search “${q.trim()}”`;
    description = `Find “${q.trim()}” at DSB Books Thimphu — check price and shelf availability.`;
  } else if (category?.trim()) {
    title = category.replace(/-/g, " ");
    description = `Shop ${title} books at DSB Books, Chang Lam, Thimphu.`;
  }

  const url = new URL(`${SITE_URL}/books`);
  if (q) url.searchParams.set("q", q);
  if (category) url.searchParams.set("category", category);
  if (pageNum > 1) url.searchParams.set("page", String(pageNum));

  return {
    title,
    description,
    alternates: { canonical: url.toString() },
    openGraph: {
      title: `${title} · DSB Books`,
      description,
      url: url.toString(),
      type: "website",
      locale: "en_BT",
      siteName: "DSB Books",
    },
    other: {
      "geo.region": "BT-15",
      "geo.placename": "Thimphu",
      "geo.position": "27.4712;89.6339",
      ICBM: "27.4712, 89.6339",
    },
  };
}

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    availability?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const { q, category, availability, sort, page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const sortKey = resolveCatalogueSort(sort);
  const theme = await getStorefrontTheme();

  let books: CatalogueBook[] = [];
  let total = 0;
  let categories: { id: string; name: string; slug: string }[] = [];
  let storeName = "DSB Books";
  let phone: string | null = null;
  let openingHours: string | null = null;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();

    const [{ data: cats }, { data: store }] = await Promise.all([
      supabase
        .from("categories")
        .select("id, name, slug, sort_order")
        .order("sort_order")
        .order("name"),
      supabase
        .from("store_settings")
        .select("store_name, phone, opening_hours")
        .eq("id", 1)
        .maybeSingle(),
    ]);

    const allCats = (cats ?? []) as {
      id: string;
      name: string;
      slug: string;
    }[];
    categories = allCats.filter((c) => c.slug !== "general-interest");
    const general = allCats.find((c) => c.slug === "general-interest");
    if (general) categories = [...categories, general];

    if (store) {
      storeName = store.store_name || storeName;
      phone = store.phone;
      openingHours = store.opening_hours;
    }

    const result = await fetchCataloguePage(
      supabase,
      {
        q,
        category,
        availability,
        sort: sortKey,
        page,
      },
      categories
    );
    books = result.books;
    total = result.total;
  }

  const activeCat = categories.find((c) => c.slug === category);

  const faqs = [
    {
      question: "Where can I buy books from DSB Books in Thimphu?",
      answer:
        "Visit DSB Books at Jojo's Shopping Complex on Chang Lam, Thimphu, or browse live stock online and enquire to reserve a title for pickup.",
    },
    {
      question: "How do I find a book in a large catalogue?",
      answer:
        "Search by title, author, ISBN or barcode, then use the category and stock chips. Scroll or tap Load more to keep browsing — default Browse order walks the full shelf, not the same few titles.",
    },
    {
      question: "Are website prices the same as in the shop?",
      answer:
        "Yes — prices are in Bhutanese Ngultrum (Nu.) and stock status comes from our Thimphu inventory.",
    },
  ];

  return (
    <StorefrontShell
      active="/books"
      theme={theme}
      compactFooter
      searchQuery={q}
    >
      <JsonLd
        data={localBusinessJsonLd({
          name: storeName,
          phone,
          openingHours,
        })}
      />
      <JsonLd
        data={booksCollectionJsonLd(books as Book[], {
          name: activeCat
            ? `${activeCat.name} books · DSB Books`
            : "Books catalogue · DSB Books Thimphu",
          url: `${SITE_URL}/books`,
          page,
        })}
      />
      <JsonLd data={faqJsonLd(faqs)} />

      <CatalogueFilterBar
        categories={categories}
        q={q}
        category={category}
        availability={availability}
        sort={sortKey}
        total={total}
      />

      <div className="mx-auto w-full max-w-6xl px-3 py-3 sm:px-4 md:px-6 md:py-4">
        <CatalogueResults
          initialBooks={books}
          initialTotal={total}
          initialPage={page}
          pageSize={CATALOGUE_PAGE_SIZE}
          q={q}
          category={category}
          availability={availability}
          sort={sortKey}
        />
      </div>
    </StorefrontShell>
  );
}
