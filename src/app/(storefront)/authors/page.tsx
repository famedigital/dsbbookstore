import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { StorefrontShell } from "@/components/storefront/shell";
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
    <StorefrontShell active="/authors">
      <div className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
        <p className="text-[0.65rem] tracking-[0.28em] text-[color:var(--dsb-gilt)] uppercase">
          Voices of the catalogue
        </p>
        <h1 className="mt-3 font-heading text-5xl font-semibold tracking-[-0.02em] md:text-6xl">
          Authors
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Writers and contributors published with DSB and stocked on Chang Lam.
        </p>

        {!isSupabaseConfigured() ? (
          <p className="mt-10 text-sm text-muted-foreground">
            Connect Supabase to load authors.
          </p>
        ) : authors.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">No authors listed yet.</p>
        ) : (
          <ul className="mt-12 divide-y divide-[color:var(--dsb-line)] border-y border-[color:var(--dsb-line)]">
            {authors.map((author) => (
              <li key={author.id}>
                <Link
                  href={`/authors/${author.slug}`}
                  className="group flex flex-col gap-2 py-7 transition-colors sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <h2 className="font-heading text-3xl font-medium tracking-[-0.01em] group-hover:text-[color:var(--dsb-lacquer)]">
                    {author.name}
                  </h2>
                  {author.bio ? (
                    <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-right">
                      {author.bio}
                    </p>
                  ) : (
                    <span className="text-[0.65rem] tracking-[0.2em] text-[color:var(--dsb-gilt)] uppercase">
                      View titles
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </StorefrontShell>
  );
}
