import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { BookCover } from "@/components/media/book-cover";
import { formatBtn, availabilityLabel } from "@/lib/erp/format";
import type { Book } from "@/types/erp";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Catalogue" };

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  let books: Book[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    let query = supabase
      .from("books")
      .select("*")
      .eq("is_published", true)
      .order("title");

    if (q?.trim()) {
      query = query.or(
        `title.ilike.%${q.trim()}%,isbn_13.ilike.%${q.trim()}%,subtitle.ilike.%${q.trim()}%`
      );
    }

    const { data } = await query;
    books = (data as Book[]) ?? [];
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f4ec,#eef2f8)]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-heading text-2xl font-semibold text-primary">
          DSB Books
        </Link>
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
          Home
        </Link>
      </header>

      <div className="mx-auto w-full max-w-6xl px-6 pb-16">
        <h1 className="font-heading text-4xl font-semibold">Catalogue</h1>
        <p className="mt-2 text-muted-foreground">
          Search DSB publications and check live shelf availability.
        </p>

        <form className="mt-8 flex max-w-xl gap-2">
          <Input
            name="q"
            defaultValue={q}
            placeholder="Title, ISBN, or keyword"
            className="bg-white"
          />
          <Button type="submit">Search</Button>
        </form>

        {!isSupabaseConfigured() ? (
          <p className="mt-10 text-sm text-muted-foreground">
            Supabase is not connected — catalogue unavailable (no mock data).
          </p>
        ) : (
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
                  <h2 className="mt-3 font-heading text-lg group-hover:text-primary">
                    {book.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {formatBtn(book.price_btn)} ·{" "}
                    {availabilityLabel(book.availability_status)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {isSupabaseConfigured() && books.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">No books found.</p>
        ) : null}
      </div>
    </div>
  );
}
