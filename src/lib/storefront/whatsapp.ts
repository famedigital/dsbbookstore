import { SITE_URL, STORE_GEO } from "@/lib/storefront/seo";

/** DSB WhatsApp — Chang Lam counter (override with NEXT_PUBLIC_WHATSAPP_NUMBER). */
export function whatsappNumberDigits() {
  const raw =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    STORE_GEO.phone.replace(/\D/g, "");
  // Bhutan local 02… → country code 975
  if (raw.startsWith("975")) return raw;
  if (raw.startsWith("0")) return `975${raw.slice(1)}`;
  return raw || "9752326275";
}

export function whatsappUrl(message: string) {
  const text = encodeURIComponent(message.trim());
  return `https://wa.me/${whatsappNumberDigits()}?text=${text}`;
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
  if (opts.price != null) lines.push(`Listed: Nu. ${Number(opts.price).toFixed(0)}`);
  if (opts.slug) lines.push(`${SITE_URL}/books/${opts.slug}`);
  lines.push("", "Thank you!");
  return lines.join("\n");
}

export function bookWhatsAppHref(opts: {
  title: string;
  slug?: string;
  isbn?: string | null;
  price?: number | null;
}) {
  return whatsappUrl(bookWhatsAppMessage(opts));
}
