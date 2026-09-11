import { SITE_URL } from "@/lib/storefront/seo";

/** Temporary default until ERP Settings / DB is set — AU mobile. */
export const DEFAULT_WHATSAPP_NUMBER = "+61 434 741 331";

/** Normalize to digits only for wa.me (keeps country code). */
export function normalizeWhatsAppDigits(
  value?: string | null,
  fallback = DEFAULT_WHATSAPP_NUMBER
): string {
  const raw = String(value || fallback).replace(/\D/g, "");
  if (!raw) return DEFAULT_WHATSAPP_NUMBER.replace(/\D/g, "");
  // Bhutan local 02… → 975…
  if (raw.startsWith("0") && !raw.startsWith("00")) {
    return `975${raw.slice(1)}`;
  }
  return raw;
}

export function whatsappNumberDigits(override?: string | null) {
  return normalizeWhatsAppDigits(
    override || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER
  );
}

export function whatsappUrl(message: string, digits?: string | null) {
  const text = encodeURIComponent(message.trim());
  return `https://wa.me/${whatsappNumberDigits(digits)}?text=${text}`;
}

export function bookWhatsAppMessage(opts: {
  title: string;
  slug?: string;
  isbn?: string | null;
  price?: number | null;
}) {
  const lines = [
    `Hi DSB Books — I'd like to ask about:`,
    `"${opts.title}"`,
  ];
  if (opts.isbn) lines.push(`ISBN/code: ${opts.isbn}`);
  if (opts.price != null)
    lines.push(`Listed: Nu. ${Number(opts.price).toFixed(0)}`);
  if (opts.slug) lines.push(`${SITE_URL}/books/${opts.slug}`);
  lines.push("", "Thank you!");
  return lines.join("\n");
}

export function bookWhatsAppHref(
  opts: {
    title: string;
    slug?: string;
    isbn?: string | null;
    price?: number | null;
  },
  digits?: string | null
) {
  return whatsappUrl(bookWhatsAppMessage(opts), digits);
}
