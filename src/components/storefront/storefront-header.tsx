import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  variant?: "solid" | "overHero";
};

export function StorefrontHeader({ variant = "solid" }: Props) {
  const overHero = variant === "overHero";

  return (
    <header
      className={
        overHero
          ? "absolute inset-x-0 top-0 z-20"
          : "border-b border-primary/10 bg-[#f4f7fb]/90 backdrop-blur"
      }
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 md:px-8">
        <Link
          href="/"
          className={
            overHero
              ? "font-heading text-2xl font-semibold tracking-tight text-white md:text-3xl"
              : "font-heading text-2xl font-semibold tracking-tight text-primary md:text-3xl"
          }
        >
          DSB Books
        </Link>
        <nav
          className={
            overHero
              ? "hidden items-center gap-6 text-sm text-white/90 md:flex"
              : "hidden items-center gap-6 text-sm text-foreground/80 md:flex"
          }
        >
          <Link href="/books" className="transition hover:text-[#e6c76a]">
            Catalogue
          </Link>
          <Link href="/authors" className="transition hover:text-[#e6c76a]">
            Authors
          </Link>
          <Link href="/visit" className="transition hover:text-[#e6c76a]">
            Visit
          </Link>
          <Link href="/enquiry" className="transition hover:text-[#e6c76a]">
            Enquire
          </Link>
          <Button
            asChild
            size="sm"
            variant="outline"
            className={
              overHero
                ? "border-white/40 bg-transparent text-white hover:bg-white/10"
                : undefined
            }
          >
            <Link href="/erp/login">Staff</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
