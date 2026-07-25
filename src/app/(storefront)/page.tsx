import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { BookCover } from "@/components/media/book-cover";
import { bookCoverProps } from "@/lib/media/book-cover-props";
import { formatBtn, availabilityLabel } from "@/lib/erp/format";
import {
  FadeIn,
  Stagger,
  StaggerItem,
} from "@/components/storefront/motion";
import type { Book } from "@/types/erp";
import type { MediaAsset } from "@/types/media";

type BookWithCover = Book & { cover?: MediaAsset | null };

export default async function HomePage() {
  let featured: BookWithCover[] = [];
  let settings: { store_name: string; opening_hours: string | null } | null =
    null;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const [{ data: books }, { data: store }] = await Promise.all([
      supabase
        .from("books")
        .select("*, cover:media_assets!cover_media_id(*)")
        .eq("is_published", true)
        .order("updated_at", { ascending: false })
        .limit(8),
      supabase
        .from("store_settings")
        .select("store_name, opening_hours")
        .eq("id", 1)
        .maybeSingle(),
    ]);
    featured = (books as BookWithCover[]) ?? [];
    settings = store;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(165deg,#f7f4ec_0%,#e8eef8_42%,#edf5f0_100%)]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-heading text-2xl font-semibold text-primary">
          DSB Books
        </Link>
        <nav className="hidden items-center gap-4 text-sm md:flex">
          <Link href="/books" className="hover:text-primary">
            Catalogue
          </Link>
          <Link href="/authors" className="hover:text-primary">
            Authors
          </Link>
          <Link href="/visit" className="hover:text-primary">
            Visit
          </Link>
          <Link href="/enquiry" className="hover:text-primary">
            Enquire
          </Link>
          <Button asChild size="sm" variant="outline">
            <Link href="/erp/login">Staff</Link>
          </Button>
        </nav>
      </header>

      <section className="relative mx-auto grid min-h-[78vh] w-full max-w-6xl items-end overflow-hidden px-6 pb-16 pt-10">
        <div className="absolute inset-0 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_30%_20%,#0b3d91_0%,transparent_55%),radial-gradient(ellipse_at_90%_80%,#0f6b4c_0%,transparent_45%),linear-gradient(135deg,#071a3a,#0b3d91_50%,#0a4a38)]" />
        <div className="absolute inset-0 -z-10 rounded-[2rem] opacity-40 [background-image:url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath d=%27M0 60L60 0M30 60L60 30M0 30L30 0%27 stroke=%27%23ffffff%27 stroke-opacity=%270.06%27 fill=%27none%27/%3E%3C/svg%3E')]" />
        <FadeIn className="max-w-xl text-white" y={20}>
          <p className="text-xs tracking-[0.28em] text-[#e6c76a] uppercase">
            Thimphu · Chang Lam
          </p>
          <h1 className="mt-4 font-heading text-5xl leading-[1.05] font-semibold md:text-6xl">
            {settings?.store_name ?? "DSB Books"}
          </h1>
          <FadeIn delay={0.12} y={12}>
            <p className="mt-5 max-w-md text-base text-white/85 md:text-lg">
              Bhutan&apos;s oldest bookstore — a living digital catalogue of DSB
              publications. Search, browse, and know what&apos;s on the shelf.
            </p>
          </FadeIn>
          <FadeIn delay={0.22} y={10}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-[#e6c76a] text-[#2a2108] hover:bg-[#f0d789]"
              >
                <Link href="/books">Browse catalogue</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/visit">Visit the store</Link>
              </Button>
            </div>
          </FadeIn>
        </FadeIn>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <FadeIn className="mb-8 flex items-end justify-between gap-4" y={12}>
          <div>
            <h2 className="font-heading text-3xl font-semibold text-foreground">
              On the shelf
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Live availability from the Thimphu store inventory.
            </p>
          </div>
          <Button asChild variant="ghost">
            <Link href="/books">View all</Link>
          </Button>
        </FadeIn>

        {!isSupabaseConfigured() ? (
          <p className="rounded-lg border border-dashed border-primary/30 bg-white/60 p-8 text-sm text-muted-foreground">
            Connect Supabase to load the live catalogue. No mock titles are shown.
          </p>
        ) : featured.length === 0 ? (
          <p className="rounded-lg border border-dashed border-primary/30 bg-white/60 p-8 text-sm text-muted-foreground">
            No published books yet. Staff can add titles in the ERP catalogue.
          </p>
        ) : (
          <Stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((book) => (
              <StaggerItem key={book.id}>
                <Link href={`/books/${book.slug}`} className="group block">
                  <BookCover
                    {...bookCoverProps(book)}
                    alt={book.title}
                    width={400}
                    height={600}
                    className="aspect-[2/3] w-full rounded-sm object-cover shadow-md transition duration-500 group-hover:scale-[1.02]"
                  />
                  <h3 className="mt-3 font-heading text-lg leading-snug group-hover:text-primary">
                    {book.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatBtn(book.price_btn)} ·{" "}
                    {availabilityLabel(book.availability_status)}
                  </p>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </div>
  );
}
