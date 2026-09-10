import type { Book } from "@/types/erp";
import { openLibraryCoverUrl } from "@/lib/cloudinary-url";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://dsbbookstore.vercel.app";

/** Google Maps / Business discovery link — Chang Lam storefront */
export const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=DSB+Books+Jojo%27s+Shopping+Complex+Chang+Lam+Thimphu+Bhutan";

export const STORE_GEO = {
  latitude: 27.4712,
  longitude: 89.6339,
  address: "Jojo's Shopping Complex, Chang Lam",
  city: "Thimphu",
  country: "BT",
  phone: "+975-2-326275",
};

export function localBusinessJsonLd(opts?: {
  name?: string;
  phone?: string | null;
  email?: string | null;
  openingHours?: string | null;
  addressLine?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BookStore",
    "@id": `${SITE_URL}/#bookstore`,
    name: opts?.name || "DSB Books",
    alternateName: "DSB Enterprises Bookstore",
    description:
      "Bhutan's bookstore on Chang Lam, Thimphu — live catalogue, DSB Publications, and in-store pickup.",
    url: SITE_URL,
    telephone: opts?.phone || STORE_GEO.phone,
    email: opts?.email || undefined,
    image: `${SITE_URL}/brand/dsb-seal-navy.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: opts?.addressLine || STORE_GEO.address,
      addressLocality: STORE_GEO.city,
      addressCountry: STORE_GEO.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: STORE_GEO.latitude,
      longitude: STORE_GEO.longitude,
    },
    hasMap: GOOGLE_MAPS_URL,
    openingHours: opts?.openingHours || "Mo-Su 09:00-20:00",
    priceRange: "Nu.",
    currenciesAccepted: "BTN",
    paymentAccepted: "Cash, Bank transfer, Card",
    areaServed: {
      "@type": "Country",
      name: "Bhutan",
    },
  };
}

export function booksCollectionJsonLd(books: Book[], opts: {
  name?: string;
  description?: string;
  url?: string;
  page?: number;
}) {
  const pageUrl = opts.url || `${SITE_URL}/books`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name || "Books at DSB Books Thimphu",
    description:
      opts.description ||
      "Browse and buy books from DSB Books — live shelf stock in Thimphu, Bhutan.",
    url: pageUrl,
    isPartOf: { "@id": `${SITE_URL}/#bookstore` },
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListUnordered",
      numberOfItems: books.length,
      itemListElement: books.map((book, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/books/${book.slug}`,
        name: book.title,
        item: productJsonLd(book),
      })),
    },
  };
}

export function productJsonLd(book: Book) {
  const availability =
    book.availability_status === "in_stock" ||
    book.availability_status === "low_stock"
      ? "https://schema.org/InStock"
      : book.availability_status === "coming_soon"
        ? "https://schema.org/PreOrder"
        : "https://schema.org/OutOfStock";

  const image =
    book.cover_public_id?.startsWith("http")
      ? book.cover_public_id
      : book.cover_public_id?.startsWith("/")
        ? `${SITE_URL}${book.cover_public_id}`
        : openLibraryCoverUrl(book.isbn_13, "L") ||
          openLibraryCoverUrl(book.barcode, "L") ||
          undefined;

  return {
    "@type": "Book",
    "@id": `${SITE_URL}/books/${book.slug}`,
    name: book.title,
    description:
      book.seo_description ||
      book.subtitle ||
      book.description?.slice(0, 300) ||
      `${book.title} available at DSB Books, Thimphu.`,
    isbn: book.isbn_13 || book.barcode || undefined,
    bookFormat: book.format
      ? `https://schema.org/${book.format === "hardcover" ? "Hardcover" : book.format === "ebook" ? "EBook" : "Paperback"}`
      : undefined,
    inLanguage: book.language || "en",
    image,
    url: `${SITE_URL}/books/${book.slug}`,
    brand: book.brand
      ? { "@type": "Brand", name: book.brand }
      : { "@type": "Brand", name: "DSB Books" },
    publisher: book.publisher_name
      ? { "@type": "Organization", name: book.publisher_name }
      : undefined,
    datePublished: book.published_at
      ? String(book.published_at).slice(0, 10)
      : undefined,
    numberOfPages: book.page_count || undefined,
    author: book.brand
      ? { "@type": "Person", name: book.brand }
      : undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/books/${book.slug}`,
      priceCurrency: "BTN",
      price: Number(book.price_btn || 0).toFixed(2),
      availability,
      seller: { "@id": `${SITE_URL}/#bookstore` },
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

export function faqJsonLd(
  faqs: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}
