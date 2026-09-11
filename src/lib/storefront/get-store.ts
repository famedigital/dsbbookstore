import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { StoreSettings } from "@/types/erp";

export type PublicStoreProfile = Pick<
  StoreSettings,
  | "store_name"
  | "legal_name"
  | "address_line1"
  | "city"
  | "country"
  | "phone"
  | "email"
  | "opening_hours"
  | "public_tagline"
  | "visit_directions"
  | "website_url"
  | "receipt_footer"
  | "receipt_header_note"
  | "receipt_thanks"
  | "receipt_paper_mm"
  | "print_mode"
  | "whatsapp_number"
>;

export const DEFAULT_PUBLIC_STORE: PublicStoreProfile = {
  store_name: "DSB Books",
  legal_name: null,
  address_line1: "Jojo's Shopping Complex, Chang Lam",
  city: "Thimphu",
  country: "Bhutan",
  phone: "02 326275",
  email: null,
  opening_hours: "Typically 9:00 – 20:00",
  public_tagline:
    "Catalogue, publications, Bhutan–Australia bridge, and digital knowledge from Chang Lam, Thimphu.",
  visit_directions:
    "Ground floor, Jojo's Shopping Complex — look for the blue DSB BOOKS sign near Druk Hotel.",
  website_url: null,
  receipt_footer: "Books · stationery · enquiries welcome",
  receipt_header_note: null,
  receipt_thanks: "Thank you for shopping at DSB Books",
  receipt_paper_mm: 80,
  print_mode: "usb",
  whatsapp_number: "+61 434 741 331",
};

export function brandParts(storeName: string) {
  const trimmed = storeName.trim() || "DSB Books";
  const match = trimmed.match(/^(DSB)\s*(.*)$/i);
  if (match) {
    return { lead: match[1].toUpperCase(), rest: match[2] || "Books" };
  }
  const space = trimmed.indexOf(" ");
  if (space > 0) {
    return { lead: trimmed.slice(0, space), rest: trimmed.slice(space + 1) };
  }
  return { lead: trimmed, rest: "" };
}

export function formatStoreAddress(store: PublicStoreProfile) {
  const lines = [
    store.address_line1,
    [store.city, store.country].filter(Boolean).join(", "),
  ].filter(Boolean);
  return lines.join("\n");
}

export async function getPublicStore(): Promise<PublicStoreProfile> {
  if (!isSupabaseConfigured()) return DEFAULT_PUBLIC_STORE;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("store_settings")
      .select(
        "store_name, legal_name, address_line1, city, country, phone, email, opening_hours, public_tagline, visit_directions, website_url, receipt_footer, receipt_header_note, receipt_thanks, receipt_paper_mm, print_mode, whatsapp_number"
      )
      .eq("id", 1)
      .maybeSingle();
    if (!data) return DEFAULT_PUBLIC_STORE;
    return {
      ...DEFAULT_PUBLIC_STORE,
      ...(data as Partial<PublicStoreProfile>),
      store_name:
        (data as { store_name?: string }).store_name ||
        DEFAULT_PUBLIC_STORE.store_name,
    };
  } catch {
    return DEFAULT_PUBLIC_STORE;
  }
}
