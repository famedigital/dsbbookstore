import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { StorefrontShell } from "@/components/storefront/shell";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";
import type { Author } from "@/types/erp";

export const metadata = { title: "Authors" };

export default async function AuthorsPage() {
  const theme = await getStorefrontTheme();
  let authors: Author[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.from("authors").select("*").order("name");
    authors = (data as Author[]) ?? [];
  }

  return (
    <StorefrontShell active="/authors" theme={theme}>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-14">
        <p className="text-[0.65rem] tracking-[0.28em] text-[color:var(--dsb-gilt)] uppercase">
          Voices of the catalogue
        </p>
        <h1 className="mt-2 font-heading text-2xl font-semibold tracking-[-0.02em] md:mt-3 md:text-4xl">
          Authors
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground md:mt-4 md:text-base">
          Writers and contributors published with DSB and stocked on Chang Lam.
        </p>

        {!isSupabaseConfigured() ? (
          <p className="mt-6 text-sm text-muted-foreground md:mt-10">
            Connect Supabase to load authors.
          </p>
        ) : authors.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground md:mt-10">
            No authors listed yet.
          </p>
        ) : (
          <ul className="mt-8 divide-y divide-[color:var(--dsb-line)] border-y border-[color:var(--dsb-line)] md:mt-12">
            {authors.map((author) => (
              <li key={author.id}>
                <Link
                  href={`/authors/${author.slug}`}
                  className="group flex flex-col gap-1.5 py-4 transition-colors sm:flex-row sm:items-baseline sm:justify-between md:gap-2 md:py-7"
                >
                  <h2 className="font-heading text-xl font-medium tracking-[-0.01em] group-hover:text-[color:var(--dsb-lacquer)] md:text-3xl">
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
