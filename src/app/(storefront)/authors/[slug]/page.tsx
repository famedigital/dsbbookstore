import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { BookCover } from "@/components/media/book-cover";
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

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12 pb-16">
      <Link href="/authors" className="text-sm text-muted-foreground hover:text-primary">
        ← All authors
      </Link>
      <h1 className="mt-4 font-heading text-4xl font-semibold">{author.name}</h1>
      {author.bio ? (
        <p className="mt-4 max-w-2xl whitespace-pre-wrap leading-relaxed text-foreground/90">
          {author.bio}
        </p>
      ) : null}

      <h2 className="font-heading mt-12 text-2xl font-semibold">Books</h2>
      {books.length === 0 ? (
        <p className="text-muted-foreground mt-4 text-sm">
          No published books linked to this author yet.
        </p>
      ) : (
        <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {books.map((book) => (
            <li key={book.id}>
              <Link href={`/books/${book.slug}`} className="group block">
                <BookCover
                  publicId={book.cover_public_id}
                  alt={book.title}
                  width={400}
                  height={600}
                  className="aspect-[2/3] w-full rounded-sm object-cover shadow-md"
                />
                <h3 className="mt-3 font-heading text-lg group-hover:text-primary">
                  {book.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formatBtn(book.price_btn)} ·{" "}
                  {availabilityLabel(book.availability_status)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
