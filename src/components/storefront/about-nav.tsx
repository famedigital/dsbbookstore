import Link from "next/link";
import { listAboutChildren } from "@/lib/cms/get-page";
import { cn } from "@/lib/utils";

export async function AboutNav({ currentSlug }: { currentSlug: string }) {
  const children = await listAboutChildren();

  return (
    <nav
      aria-label="About sections"
      className="mb-8 -mx-6 flex gap-2 overflow-x-auto px-6 pb-2 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0 lg:pb-0"
    >
      <Link
        href="/about"
        className={cn(
          "inline-flex shrink-0 rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors lg:block",
          currentSlug === "about"
            ? "bg-primary/10 font-medium text-primary"
            : "text-muted-foreground hover:text-primary"
        )}
        aria-current={currentSlug === "about" ? "page" : undefined}
      >
        Overview
      </Link>
      {children.map((page) => {
        const active = page.slug === currentSlug;
        return (
          <Link
            key={page.id}
            href={`/${page.slug}`}
            className={cn(
              "inline-flex shrink-0 rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors motion-safe:animate-in motion-safe:fade-in lg:block",
              active
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
            aria-current={active ? "page" : undefined}
          >
            {page.nav_label ?? page.title}
          </Link>
        );
      })}
    </nav>
  );
}
