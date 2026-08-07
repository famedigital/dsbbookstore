import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Author } from "@/types/erp";

export const metadata = { title: "Authors" };

export default async function AuthorsPage() {
  let authors: Author[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.from("authors").select("*").order("name");
    authors = (data as Author[]) ?? [];
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12 pb-16">
      <h1 className="font-heading text-4xl font-semibold">Authors</h1>
      <p className="mt-2 text-muted-foreground">
        Writers and contributors in the DSB catalogue.
      </p>

      {!isSupabaseConfigured() ? (
        <p className="mt-10 text-sm text-muted-foreground">
          Connect Supabase to load authors.
        </p>
      ) : authors.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">No authors listed yet.</p>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((author) => (
            <li key={author.id}>
              <Link
                href={`/authors/${author.slug}`}
                className="block rounded-lg border bg-white/80 p-5 transition hover:border-primary/40 hover:shadow-sm"
              >
                <h2 className="font-heading text-xl font-medium hover:text-primary">
                  {author.name}
                </h2>
                {author.bio ? (
                  <p className="text-muted-foreground mt-2 line-clamp-3 text-sm">
                    {author.bio}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
