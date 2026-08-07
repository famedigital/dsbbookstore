export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export const PRIMARY_NAV = [
  { href: "/books", label: "Catalogue" },
  { href: "/authors", label: "Authors" },
  { href: "/about", label: "About" },
  { href: "/visit", label: "Visit" },
  { href: "/enquiry", label: "Enquire" },
] as const;

export function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/about") return pathname === "/about" || pathname.startsWith("/about/");
  if (href === "/books") return pathname === "/books" || pathname.startsWith("/books/");
  if (href === "/authors")
    return pathname === "/authors" || pathname.startsWith("/authors/");
  return pathname === href || pathname.startsWith(`${href}/`);
}
