import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { BookCover } from "@/components/media/book-cover";
import { StorefrontShell } from "@/components/storefront/shell";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";
import { formatBtn, availabilityLabel } from "@/lib/erp/format";
import type { Author, Book } from "@/types/erp";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  if (!isSupabaseConfigured()) {
    return { title: "Author" };
  }

  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("authors")
    .select("name, bio")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return { title: "Author not found" };

  return {
    title: data.name,
    description: data.bio?.slice(0, 160),
  };
}

export default async function AuthorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!isSupabaseConfigured()) notFound();

  const { slug } = await params;
  const supabase = await createClient();
  const { data: authorRow } = await supabase
    .from("authors")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!authorRow) notFound();
  const author = authorRow as Author;

  const { data: links } = await supabase
    .from("book_authors")
    .select("books(*)")
    .eq("author_id", author.id);

  const books = (links ?? [])
    .flatMap((row) => {
      const b = row.books;
      if (!b) return [];
      return Array.isArray(b) ? b : [b];
    })
    .filter((b): b is Book => !!b && b.is_published);

  const theme = await getStorefrontTheme();

  return (
    <StorefrontShell active="/authors" theme={theme}>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-14">
        <Link
          href="/authors"
          className="text-[0.7rem] tracking-[0.2em] text-[color:var(--dsb-gilt)] uppercase hover:text-[color:var(--dsb-lacquer)]"
        >
          ← All authors
        </Link>
        <h1 className="mt-4 font-heading text-3xl font-semibold tracking-[-0.02em] md:mt-6 md:text-5xl">
          {author.name}
        </h1>
        {author.bio ? (
          <p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground md:mt-5 md:text-base">
            {author.bio}
          </p>
        ) : null}

        <h2 className="mt-8 font-heading text-xl font-semibold md:mt-14 md:text-3xl">
          Books
        </h2>
        {books.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No published books linked to this author yet.
          </p>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 md:mt-8 md:gap-x-8 md:gap-y-12 lg:grid-cols-4">
            {books.map((book) => (
              <li key={book.id} className="group">
                <Link href={`/books/${book.slug}`} className="block">
                  <div className="overflow-hidden bg-[color:var(--dsb-stone)]">
                    <BookCover
                      publicId={book.cover_public_id}
                      alt={book.title}
                      width={400}
                      height={600}
                      className="aspect-[2/3] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  <h3 className="mt-2 font-heading text-sm group-hover:text-[color:var(--dsb-lacquer)] md:mt-4 md:text-2xl">
                    {book.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatBtn(book.price_btn)} ·{" "}
                    {availabilityLabel(book.availability_status)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </StorefrontShell>
  );
}
