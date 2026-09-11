export type UserRole = "owner" | "manager" | "staff" | "customer";

export type AvailabilityStatus =
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "coming_soon"
  | "enquire_only";

export type StockMovementType =
  | "purchase_in"
  | "sale_out"
  | "adjustment"
  | "damage"
  | "return_in"
  | "return_out"
  | "transfer"
  | "count_adjust";

export type OrderStatus =
  | "draft"
  | "confirmed"
  | "paid"
  | "cod_pending"
  | "fulfilled"
  | "cancelled"
  | "refunded";

export type OrderChannel = "pos" | "online" | "phone" | "wholesale";

export type FulfillmentType =
  | "pickup"
  | "thimphu_delivery"
  | "nationwide"
  | "international"
  | "digital";

export type PaymentMethod =
  | "cash"
  | "cod"
  | "bank_qr"
  | "card"
  | "transfer"
  | "other";

export type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "partial";

export type EnquiryStatus = "new" | "in_progress" | "closed";

export type PoStatus =
  | "draft"
  | "ordered"
  | "partial"
  | "received"
  | "cancelled"
  | "closed";

export type PublishingStage =
  | "idea"
  | "editing"
  | "design"
  | "print"
  | "published"
  | "archived";

export type ProductKind = "book" | "stationery" | "other";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Book = {
  id: string;
  /** Stock Register: Product */
  title: string;
  subtitle: string | null;
  slug: string;
  description: string | null;
  isbn_13: string | null;
  isbn_10: string | null;
  /** Stock Register: UPCEAN */
  barcode: string | null;
  sku_code: string | null;
  product_kind: ProductKind;
  /** Stock Register: Brand (author / imprint) */
  brand: string | null;
  language: string | null;
  format: string | null;
  page_count: number | null;
  dimensions: string | null;
  weight_grams: number | null;
  published_at: string | null;
  publisher_name: string | null;
  /** Stock Register: Pur Rate */
  cost_price_btn: number;
  /** Stock Register: Sal Rate */
  price_btn: number;
  compare_at_price_btn: number | null;
  /** Stock Register: Opening */
  opening_qty: number;
  /** Stock Register: Closing */
  stock_qty: number;
  /** Stock Register: Clo Val */
  clo_val_btn: number;
  low_stock_threshold: number | null;
  availability_status: AvailabilityStatus;
  cover_public_id: string | null;
  is_featured: boolean;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  /** openlibrary | google_books | ai | mixed */
  metadata_source: string | null;
  metadata_enriched_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Alias — catalogue SKUs include books, stationery, and other products. */
export type CatalogProduct = Book;

export type Author = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  photo_public_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
};

export type Collection = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  hero_public_id: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
};

export type Customer = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  organization: string | null;
  customer_type: string;
  notes: string | null;
  profile_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Enquiry = {
  id: string;
  book_id: string | null;
  customer_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: EnquiryStatus;
  assigned_to: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  order_number: string;
  channel: OrderChannel;
  status: OrderStatus;
  customer_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  fulfillment_type: FulfillmentType | null;
  shipping_address: Record<string, unknown> | null;
  subtotal_btn: number;
  discount_btn: number;
  shipping_fee_btn: number;
  tax_btn: number;
  total_btn: number;
  pos_session_id: string | null;
  created_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  book_id: string;
  title_snapshot: string;
  quantity: number;
  unit_price_btn: number;
  unit_cost_btn: number;
  line_total_btn: number;
};

export type Payment = {
  id: string;
  order_id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount_btn: number;
  reference: string | null;
  received_by: string | null;
  paid_at: string | null;
  created_at: string;
};

export type Supplier = {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
};

export type PurchaseOrder = {
  id: string;
  po_number: string;
  supplier_id: string | null;
  status: PoStatus;
  ordered_at: string | null;
  expected_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type StockMovement = {
  id: string;
  book_id: string;
  movement_type: StockMovementType;
  qty_delta: number;
  reason: string | null;
  reference_type: string | null;
  reference_id: string | null;
  created_by: string | null;
  created_at: string;
};

export type Expense = {
  id: string;
  category: string;
  description: string | null;
  amount_btn: number;
  expense_date: string;
  created_by: string | null;
  created_at: string;
};

export type StoreSettings = {
  id: number;
  store_name: string;
  legal_name: string | null;
  address_line1: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  opening_hours: string | null;
  currency_code: string;
  low_stock_default: number;
  receipt_footer: string | null;
  tax_enabled: boolean;
  tax_rate: number;
  /** Figma storefront preset: uikit | booksaw | booketic | atelier */
  storefront_theme?: string | null;
  public_tagline?: string | null;
  visit_directions?: string | null;
  website_url?: string | null;
  receipt_header_note?: string | null;
  receipt_thanks?: string | null;
  receipt_paper_mm?: number | null;
  print_mode?: "usb" | "none" | string | null;
  bank_qr_image_url?: string | null;
  /** WhatsApp for storefront CTAs (wa.me) — not the shop landline */
  whatsapp_number?: string | null;
  updated_at: string;
};

export type PublishingTitle = {
  id: string;
  book_id: string | null;
  working_title: string;
  stage: PublishingStage;
  editor_notes: string | null;
  target_publish_date: string | null;
  created_at: string;
  updated_at: string;
};

export const STAFF_ROLES: UserRole[] = ["owner", "manager", "staff"];
export const MANAGER_ROLES: UserRole[] = ["owner", "manager"];
