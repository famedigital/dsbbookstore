"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { requireStaff, requireManager, requireOwner } from "@/lib/erp/auth";
import { orderNumber, poNumber, slugify } from "@/lib/erp/format";
import type { PaymentMethod } from "@/types/erp";

async function audit(
  actorId: string,
  action: string,
  entityType: string,
  entityId?: string,
  meta?: Record<string, unknown>
) {
  const supabase = await createClient();
  await supabase.from("audit_logs").insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    meta: meta ?? null,
  });
}

/** Quick cover set from catalogue modal (link / Cloudinary upload / library pick). */
export async function updateBookCover(bookId: string, coverPublicId: string | null) {
  const { userId } = await requireStaff();
  const supabase = await createClient();
  const id = String(bookId || "").trim();
  if (!id) throw new Error("Missing book id");

  const cover =
    coverPublicId == null || !String(coverPublicId).trim()
      ? null
      : String(coverPublicId).trim();

  const { error } = await supabase
    .from("books")
    .update({ cover_public_id: cover, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await audit(userId, "book.cover_update", "book", id, {
    cover_public_id: cover,
  });

  revalidatePath("/erp/catalogue");
  revalidatePath(`/erp/catalogue/${id}`);
  revalidatePath("/books");
  revalidatePath("/");
  return { ok: true as const };
}

export async function upsertBook(formData: FormData) {
  const { userId, profile } = await requireStaff();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("Title is required");

  const pageCountRaw = String(formData.get("page_count") || "").trim();
  const page_count = pageCountRaw ? Number(pageCountRaw) : null;
  const publishedRaw = String(formData.get("published_at") || "").trim();
  const published_at = publishedRaw || null;
  const kindRaw = String(formData.get("product_kind") || "book");
  const product_kind = ["book", "stationery", "other"].includes(kindRaw)
    ? kindRaw
    : "book";

  const openingRaw = String(formData.get("opening_qty") || "").trim();
  const brandRaw = String(formData.get("brand") || "").trim();
  const payload = {
    title,
    subtitle: String(formData.get("subtitle") || "") || null,
    slug: String(formData.get("slug") || slugify(title)),
    description: String(formData.get("description") || "") || null,
    isbn_13: String(formData.get("isbn_13") || "") || null,
    barcode: String(formData.get("barcode") || "") || null,
    sku_code: String(formData.get("sku_code") || "") || null,
    product_kind,
    brand: brandRaw || null,
    language: String(formData.get("language") || "English"),
    format: String(formData.get("format") || "paperback"),
    publisher_name: String(formData.get("publisher_name") || "DSB Publication"),
    published_at,
    page_count,
    price_btn: Number(formData.get("price_btn") || 0),
    cost_price_btn:
      profile.role === "staff"
        ? undefined
        : Number(formData.get("cost_price_btn") || 0),
    opening_qty: openingRaw ? Math.max(0, Number(openingRaw) || 0) : undefined,
    cover_public_id: String(formData.get("cover_public_id") || "") || null,
    is_published: formData.get("is_published") === "on",
    is_featured: formData.get("is_featured") === "on",
  };

  let bookId = id;

  if (id) {
    const { error } = await supabase.from("books").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
    await audit(userId, "book.update", "book", id, { title, product_kind });
  } else {
    const stockQty = Number(formData.get("stock_qty") || 0);
    const { data, error } = await supabase
      .from("books")
      .insert({
        ...payload,
        cost_price_btn: Number(formData.get("cost_price_btn") || 0),
        stock_qty: Number.isFinite(stockQty) ? Math.max(0, stockQty) : 0,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    bookId = data.id;
    await audit(userId, "book.create", "book", data.id, { title, product_kind });
  }

  revalidatePath("/erp/catalogue");
  revalidatePath("/books");
  revalidatePath("/stationery");
  if (bookId) {
    revalidatePath(`/erp/catalogue/${bookId}`);
    redirect(`/erp/catalogue/${bookId}`);
  }
}

export async function importProductsCsv(formData: FormData) {
  const { userId, profile } = await requireStaff();
  const supabase = await createClient();
  const raw = String(formData.get("csv") || "").trim();
  if (!raw) throw new Error("Paste or upload CSV content");

  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new Error("CSV needs a header row and at least one product");

  function splitCsv(line: string) {
    const out: string[] = [];
    let cur = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        q = !q;
        continue;
      }
      if (ch === "," && !q) {
        out.push(cur.trim());
        cur = "";
        continue;
      }
      cur += ch;
    }
    out.push(cur.trim());
    return out;
  }

  const headers = splitCsv(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, "_"));
  const titleIdx = headers.indexOf("title");
  if (titleIdx < 0) throw new Error("CSV must include a title column");

  const idx = (name: string) => headers.indexOf(name);
  let created = 0;

  for (const line of lines.slice(1)) {
    const cols = splitCsv(line);
    const title = (cols[titleIdx] || "").trim();
    if (!title) continue;
    const kindRaw = (cols[idx("product_kind")] || cols[idx("kind")] || "book").toLowerCase();
    const product_kind = ["book", "stationery", "other"].includes(kindRaw)
      ? kindRaw
      : "book";
    const price = Number(cols[idx("price_btn")] || cols[idx("price")] || 0);
    const cost = Number(cols[idx("cost_price_btn")] || cols[idx("cost")] || 0);
    const stock = Number(cols[idx("stock_qty")] || cols[idx("stock")] || 0);
    const payload = {
      title,
      slug: slugify(title),
      product_kind,
      isbn_13: cols[idx("isbn_13")] || cols[idx("isbn")] || null,
      barcode: cols[idx("barcode")] || null,
      sku_code: cols[idx("sku_code")] || cols[idx("sku")] || null,
      language: cols[idx("language")] || "English",
      format: cols[idx("format")] || (product_kind === "book" ? "paperback" : "unit"),
      publisher_name: cols[idx("publisher_name")] || cols[idx("publisher")] || "DSB Publication",
      price_btn: Number.isFinite(price) ? price : 0,
      cost_price_btn:
        profile.role === "staff" ? 0 : Number.isFinite(cost) ? cost : 0,
      stock_qty: Number.isFinite(stock) ? Math.max(0, stock) : 0,
      is_published: ["1", "true", "yes", "y"].includes(
        String(cols[idx("is_published")] || "").toLowerCase()
      ),
      description: cols[idx("description")] || null,
    };
    const { data, error } = await supabase
      .from("books")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(`${title}: ${error.message}`);
    await audit(userId, "book.create", "book", data.id, {
      title,
      product_kind,
      import: true,
    });
    created += 1;
  }

  revalidatePath("/erp/catalogue");
  revalidatePath("/books");
  revalidatePath("/stationery");
  redirect(`/erp/catalogue?imported=${created}`);
}

export async function adjustStock(formData: FormData) {
  const { userId } = await requireStaff();
  const supabase = await createClient();

  const bookId = String(formData.get("book_id"));
  const qtyDelta = Number(formData.get("qty_delta"));
  const reason = String(formData.get("reason") || "").trim();
  const movementType = String(formData.get("movement_type") || "adjustment");

  if (!bookId || !qtyDelta || !reason) {
    throw new Error("Book, quantity change, and reason are required");
  }

  const { error } = await supabase.from("stock_movements").insert({
    book_id: bookId,
    movement_type: movementType,
    qty_delta: qtyDelta,
    reason,
    created_by: userId,
  });
  if (error) throw new Error(error.message);

  await audit(userId, "stock.adjust", "book", bookId, {
    qty_delta: qtyDelta,
    reason,
  });

  revalidatePath("/erp/inventory");
  revalidatePath("/erp/catalogue");
}

export async function createPosSale(input: {
  items: { bookId: string; title: string; qty: number; unitPrice: number; unitCost: number }[];
  paymentMethod: PaymentMethod;
  customerName?: string;
  customerPhone?: string;
  tendered?: number;
  paymentReference?: string;
}) {
  const { userId } = await requireStaff();
  const supabase = await createClient();

  if (!input.items.length) throw new Error("Cart is empty");

  const subtotal = input.items.reduce(
    (sum, i) => sum + i.qty * i.unitPrice,
    0
  );

  if (
    input.paymentMethod === "cash" &&
    input.tendered != null &&
    input.tendered + 0.001 < subtotal
  ) {
    throw new Error("Need cash to cover the due");
  }

  const number = orderNumber();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: number,
      channel: "pos",
      status: input.paymentMethod === "cod" ? "cod_pending" : "paid",
      customer_name: input.customerName || "Walk-in",
      customer_phone: input.customerPhone || null,
      fulfillment_type: "pickup",
      subtotal_btn: subtotal,
      total_btn: subtotal,
      created_by: userId,
    })
    .select("id")
    .single();

  if (orderError) throw new Error(orderError.message);

  const lines = input.items.map((i) => ({
    order_id: order.id,
    book_id: i.bookId,
    title_snapshot: i.title,
    quantity: i.qty,
    unit_price_btn: i.unitPrice,
    unit_cost_btn: i.unitCost,
    line_total_btn: i.qty * i.unitPrice,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(lines);
  if (itemsError) throw new Error(itemsError.message);

  const refParts = [
    input.paymentReference?.trim() || "",
    input.paymentMethod === "cash" && input.tendered != null
      ? `cash_in=${input.tendered}`
      : "",
  ].filter(Boolean);

  const { error: payError } = await supabase.from("payments").insert({
    order_id: order.id,
    method: input.paymentMethod,
    status: input.paymentMethod === "cod" ? "pending" : "completed",
    amount_btn: subtotal,
    reference: refParts.join(" ") || null,
    received_by: userId,
    paid_at: input.paymentMethod === "cod" ? null : new Date().toISOString(),
  });
  if (payError) throw new Error(payError.message);

  for (const item of input.items) {
    const { error: stockError } = await supabase.from("stock_movements").insert({
      book_id: item.bookId,
      movement_type: "sale_out",
      qty_delta: -item.qty,
      reason: `POS sale ${number}`,
      reference_type: "order",
      reference_id: order.id,
      created_by: userId,
    });
    if (stockError) throw new Error(stockError.message);
  }

  await audit(userId, "pos.sale", "order", order.id, {
    order_number: number,
    total: subtotal,
    tendered: input.tendered,
  });

  revalidatePath("/erp/orders");
  revalidatePath("/erp/inventory");
  revalidatePath("/erp/pos");
  revalidatePath("/erp/counter");
  revalidatePath("/erp");

  return { orderId: order.id, orderNumber: number };
}

export async function updateEnquiryStatus(formData: FormData) {
  const { userId } = await requireStaff();
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const adminNotes = String(formData.get("admin_notes") || "");

  const { error } = await supabase
    .from("enquiries")
    .update({
      status,
      admin_notes: adminNotes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  await audit(userId, "enquiry.update", "enquiry", id, { status });
  revalidatePath("/erp/enquiries");
}

export async function upsertCustomer(formData: FormData) {
  const { userId } = await requireStaff();
  const supabase = await createClient();
  const id = String(formData.get("id") || "");
  const fullName = String(formData.get("full_name") || "").trim();
  if (!fullName) throw new Error("Name is required");

  const payload = {
    full_name: fullName,
    email: String(formData.get("email") || "") || null,
    phone: String(formData.get("phone") || "") || null,
    organization: String(formData.get("organization") || "") || null,
    customer_type: String(formData.get("customer_type") || "individual"),
    notes: String(formData.get("notes") || "") || null,
  };

  if (id) {
    const { error } = await supabase.from("customers").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from("customers")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await audit(userId, "customer.create", "customer", data.id);
  }

  revalidatePath("/erp/customers");
}

export async function createPurchaseOrder(formData: FormData) {
  const { userId } = await requireManager();
  const supabase = await createClient();
  const supplierId = String(formData.get("supplier_id") || "") || null;
  const notes = String(formData.get("notes") || "") || null;
  const invoiceRef = String(formData.get("invoice_ref") || "").trim() || null;
  const notesMerged = [invoiceRef ? `Invoice: ${invoiceRef}` : null, notes]
    .filter(Boolean)
    .join("\n") || null;

  type LineIn = { book_id: string; qty_ordered: number; unit_cost_btn: number };
  let lines: LineIn[] = [];
  const linesRaw = String(formData.get("lines") || "").trim();
  if (linesRaw) {
    const parsed = JSON.parse(linesRaw) as LineIn[];
    if (!Array.isArray(parsed) || !parsed.length) {
      throw new Error("Add at least one line");
    }
    lines = parsed
      .map((l) => ({
        book_id: String(l.book_id || ""),
        qty_ordered: Math.max(0, Math.round(Number(l.qty_ordered) || 0)),
        unit_cost_btn: Number(l.unit_cost_btn) || 0,
      }))
      .filter((l) => l.book_id && l.qty_ordered > 0);
  } else {
    const bookId = String(formData.get("book_id") || "");
    const qty = Number(formData.get("qty_ordered") || 0);
    const unitCost = Number(formData.get("unit_cost_btn") || 0);
    if (bookId && qty > 0) {
      lines = [{ book_id: bookId, qty_ordered: qty, unit_cost_btn: unitCost }];
    }
  }

  if (!lines.length) throw new Error("Add at least one product line");

  const number = poNumber();
  const { data: po, error } = await supabase
    .from("purchase_orders")
    .insert({
      po_number: number,
      supplier_id: supplierId,
      status: "ordered",
      ordered_at: new Date().toISOString(),
      notes: notesMerged,
      created_by: userId,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const { error: itemError } = await supabase.from("purchase_order_items").insert(
    lines.map((l) => ({
      purchase_order_id: po.id,
      book_id: l.book_id,
      qty_ordered: l.qty_ordered,
      unit_cost_btn: l.unit_cost_btn,
    }))
  );
  if (itemError) throw new Error(itemError.message);

  await audit(userId, "po.create", "purchase_order", po.id, {
    po_number: number,
    lines: lines.length,
    invoice_ref: invoiceRef,
  });
  revalidatePath("/erp/purchasing");
}

export async function receivePurchaseOrder(formData: FormData) {
  const { userId } = await requireManager();
  const supabase = await createClient();
  const poId = String(formData.get("purchase_order_id"));

  const { data: items, error } = await supabase
    .from("purchase_order_items")
    .select("*")
    .eq("purchase_order_id", poId);
  if (error) throw new Error(error.message);
  if (!items?.length) throw new Error("PO has no items");

  type Recv = { item_id: string; qty: number };
  const linesRaw = String(formData.get("lines") || "").trim();
  let receivePlan: { item: (typeof items)[0]; qty: number }[] = [];

  if (linesRaw) {
    const parsed = JSON.parse(linesRaw) as Recv[];
    const byId = new Map(items.map((i) => [i.id, i]));
    for (const row of parsed) {
      const item = byId.get(String(row.item_id));
      if (!item) continue;
      const remaining = item.qty_ordered - item.qty_received;
      const qty = Math.min(
        remaining,
        Math.max(0, Math.round(Number(row.qty) || 0))
      );
      if (qty > 0) receivePlan.push({ item, qty });
    }
  } else {
    // Receive all remaining (legacy one-click)
    for (const item of items) {
      const remaining = item.qty_ordered - item.qty_received;
      if (remaining > 0) receivePlan.push({ item, qty: remaining });
    }
  }

  if (!receivePlan.length) throw new Error("Nothing to receive");

  const { data: receipt, error: grError } = await supabase
    .from("goods_receipts")
    .insert({ purchase_order_id: poId, received_by: userId })
    .select("id")
    .single();
  if (grError) throw new Error(grError.message);

  for (const { item, qty } of receivePlan) {
    await supabase.from("goods_receipt_items").insert({
      goods_receipt_id: receipt.id,
      book_id: item.book_id,
      qty,
      unit_cost_btn: item.unit_cost_btn,
    });

    await supabase
      .from("purchase_order_items")
      .update({ qty_received: item.qty_received + qty })
      .eq("id", item.id);

    await supabase.from("stock_movements").insert({
      book_id: item.book_id,
      movement_type: "purchase_in",
      qty_delta: qty,
      reason: `Goods receipt for PO`,
      reference_type: "goods_receipt",
      reference_id: receipt.id,
      created_by: userId,
    });

    if (Number(item.unit_cost_btn) > 0) {
      await supabase
        .from("books")
        .update({ cost_price_btn: item.unit_cost_btn })
        .eq("id", item.book_id);
    }
  }

  const { data: refreshed } = await supabase
    .from("purchase_order_items")
    .select("qty_ordered, qty_received")
    .eq("purchase_order_id", poId);

  const allDone = (refreshed ?? []).every(
    (i) => i.qty_received >= i.qty_ordered
  );
  const anyRecv = (refreshed ?? []).some((i) => i.qty_received > 0);

  await supabase
    .from("purchase_orders")
    .update({
      status: allDone ? "received" : anyRecv ? "partial" : "ordered",
      updated_at: new Date().toISOString(),
    })
    .eq("id", poId);

  await audit(userId, "po.receive", "purchase_order", poId, {
    lines: receivePlan.length,
    partial: !allDone,
  });
  revalidatePath("/erp/purchasing");
  revalidatePath("/erp/inventory");
  revalidatePath("/erp/catalogue");
}

export async function commitStocktake(input: {
  lines: { bookId: string; physicalQty: number; systemQty: number }[];
  note?: string;
}) {
  const { userId } = await requireManager();
  const supabase = await createClient();
  const note = (input.note || "Stock count").trim();

  if (!input.lines?.length) throw new Error("No count lines");

  let posted = 0;
  for (const line of input.lines) {
    const physical = Math.max(0, Math.round(Number(line.physicalQty) || 0));
    const system = Math.round(Number(line.systemQty) || 0);
    const delta = physical - system;
    if (delta === 0) continue;

    const { error } = await supabase.from("stock_movements").insert({
      book_id: line.bookId,
      movement_type: "count_adjust",
      qty_delta: delta,
      reason: note,
      reference_type: "stocktake",
      created_by: userId,
    });
    if (error) throw new Error(error.message);
    posted += 1;
  }

  await audit(userId, "stock.count", "stocktake", undefined, {
    lines: input.lines.length,
    posted,
  });
  revalidatePath("/erp/inventory");
  revalidatePath("/erp/catalogue");
  return { posted };
}

export async function createSupplier(formData: FormData) {
  await requireManager();
  const supabase = await createClient();
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Supplier name required");

  const { error } = await supabase.from("suppliers").insert({
    name,
    contact_name: String(formData.get("contact_name") || "") || null,
    email: String(formData.get("email") || "") || null,
    phone: String(formData.get("phone") || "") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/erp/purchasing");
}

export async function createExpense(formData: FormData) {
  const { userId } = await requireManager();
  const supabase = await createClient();
  const category = String(formData.get("category") || "").trim();
  const amount = Number(formData.get("amount_btn") || 0);
  if (!category || amount <= 0) throw new Error("Category and amount required");

  const { error } = await supabase.from("expenses").insert({
    category,
    description: String(formData.get("description") || "") || null,
    amount_btn: amount,
    expense_date: String(formData.get("expense_date") || new Date().toISOString().slice(0, 10)),
    created_by: userId,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/erp/finance");
  revalidatePath("/erp/reports");
}

export async function updateStoreSettings(formData: FormData) {
  await requireOwner();
  const supabase = await createClient();
  // Production storefront is atelier-only (legacy kits demoted).
  void formData.get("storefront_theme");
  const storefront_theme = "atelier";

  const { error } = await supabase
    .from("store_settings")
    .update({
      store_name: String(formData.get("store_name") || "DSB Books"),
      phone: String(formData.get("phone") || "") || null,
      email: String(formData.get("email") || "") || null,
      opening_hours: String(formData.get("opening_hours") || "") || null,
      address_line1: String(formData.get("address_line1") || "") || null,
      low_stock_default: Number(formData.get("low_stock_default") || 3),
      receipt_footer: String(formData.get("receipt_footer") || "") || null,
      bank_qr_image_url:
        String(formData.get("bank_qr_image_url") || "") || null,
      public_tagline: String(formData.get("public_tagline") || "") || null,
      visit_directions:
        String(formData.get("visit_directions") || "") || null,
      storefront_theme,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/erp/settings");
  revalidatePath("/erp/counter");
  revalidatePath("/", "layout");
  revalidatePath("/books");
  revalidatePath("/stationery");
  revalidatePath("/authors");
  revalidatePath("/visit");
  revalidatePath("/enquiry");
  revalidatePath("/australia");
  revalidatePath("/digital-lab");
  revalidatePath("/about");
  revalidatePath("/publications");
  revalidatePath("/schools");
  revalidatePath("/partner");
  revalidatePath("/impact");
  revalidatePath("/orders");
}

export async function updateCmsPage(formData: FormData) {
  await requireManager();
  const supabase = await createClient();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Missing page id");

  const statusRaw = String(formData.get("status") || "published");
  const status = statusRaw === "draft" ? "draft" : "published";

  const { error } = await supabase
    .from("cms_pages")
    .update({
      title: String(formData.get("title") || "").trim() || "Untitled",
      seo_title: String(formData.get("seo_title") || "") || null,
      seo_description: String(formData.get("seo_description") || "") || null,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/erp/content");
  revalidatePath(`/erp/content/${id}`);
  revalidatePath("/", "layout");
}

export async function updateCmsSection(formData: FormData) {
  await requireManager();
  const supabase = await createClient();
  const id = String(formData.get("id") || "");
  const pageId = String(formData.get("page_id") || "");
  if (!id) throw new Error("Missing section id");

  const bodyRaw = String(formData.get("body") || "").trim();
  let body: unknown = [];
  if (bodyRaw) {
    try {
      body = JSON.parse(bodyRaw);
    } catch {
      body = bodyRaw
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
    }
  }

  const { error } = await supabase
    .from("cms_sections")
    .update({
      eyebrow: String(formData.get("eyebrow") || "") || null,
      heading: String(formData.get("heading") || "") || null,
      summary: String(formData.get("summary") || "") || null,
      body,
      cta_label: String(formData.get("cta_label") || "") || null,
      cta_href: String(formData.get("cta_href") || "") || null,
      image_url: String(formData.get("image_url") || "") || null,
      image_alt: String(formData.get("image_alt") || "") || null,
      is_visible: formData.get("is_visible") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  // Keep media library in sync when a local/cloudinary path is set
  const imageUrl = String(formData.get("image_url") || "").trim();
  if (imageUrl) {
    const { data: existing } = await supabase
      .from("cms_media")
      .select("id")
      .eq("url", imageUrl)
      .maybeSingle();
    if (!existing) {
      await supabase.from("cms_media").insert({
        url: imageUrl.startsWith("/") ? imageUrl : null,
        public_id: imageUrl.startsWith("/") ? null : imageUrl,
        alt: String(formData.get("image_alt") || "") || null,
        kind: "hero",
      });
    }
  }

  revalidatePath("/erp/content");
  if (pageId) revalidatePath(`/erp/content/${pageId}`);
  revalidatePath("/", "layout");
}

export async function updateStaffRole(formData: FormData) {
  const { userId } = await requireOwner();
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const role = String(formData.get("role"));
  const isActive = formData.get("is_active") === "on";

  const { error } = await supabase
    .from("profiles")
    .update({ role, is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await audit(userId, "staff.update", "profile", id, { role, isActive });
  revalidatePath("/erp/staff");
}

export async function createPublishingTitle(formData: FormData) {
  const { userId } = await requireManager();
  const supabase = await createClient();
  const title = String(formData.get("working_title") || "").trim();
  if (!title) throw new Error("Working title required");

  const { data, error } = await supabase
    .from("publishing_titles")
    .insert({
      working_title: title,
      stage: String(formData.get("stage") || "idea"),
      editor_notes: String(formData.get("editor_notes") || "") || null,
      book_id: String(formData.get("book_id") || "") || null,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  await audit(userId, "publishing.create", "publishing_title", data.id);
  revalidatePath("/erp/publishing");
}

export async function updateOrderStatus(formData: FormData) {
  const { userId } = await requireStaff();
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await audit(userId, "order.update", "order", id, { status });
  revalidatePath("/erp/orders");
  revalidatePath(`/erp/orders/${id}`);
}

export async function upsertAuthor(formData: FormData) {
  const { userId } = await requireStaff();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Name is required");

  const payload = {
    name,
    slug: String(formData.get("slug") || slugify(name)),
    bio: String(formData.get("bio") || "") || null,
  };

  if (id) {
    const { error } = await supabase.from("authors").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
    await audit(userId, "author.update", "author", id, { name });
  } else {
    const { data, error } = await supabase
      .from("authors")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await audit(userId, "author.create", "author", data.id, { name });
  }

  revalidatePath("/erp/authors");
}

export async function upsertCategory(formData: FormData) {
  const { userId } = await requireStaff();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Name is required");

  const payload = {
    name,
    slug: String(formData.get("slug") || slugify(name)),
    description: String(formData.get("description") || "") || null,
    sort_order: Number(formData.get("sort_order") || 0),
  };

  if (id) {
    const { error } = await supabase.from("categories").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
    await audit(userId, "category.update", "category", id, { name });
  } else {
    const { data, error } = await supabase
      .from("categories")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await audit(userId, "category.create", "category", data.id, { name });
  }

  revalidatePath("/erp/categories");
}

export async function setBookAuthors(formData: FormData) {
  const { userId } = await requireStaff();
  const supabase = await createClient();

  const bookId = String(formData.get("book_id"));
  const authorIds = formData.getAll("author_ids").map(String);

  if (!bookId) throw new Error("Book is required");

  const { error: deleteError } = await supabase
    .from("book_authors")
    .delete()
    .eq("book_id", bookId);
  if (deleteError) throw new Error(deleteError.message);

  if (authorIds.length > 0) {
    const rows = authorIds.map((authorId, index) => ({
      book_id: bookId,
      author_id: authorId,
      sort_order: index,
    }));
    const { error } = await supabase.from("book_authors").insert(rows);
    if (error) throw new Error(error.message);
  }

  await audit(userId, "book.authors", "book", bookId, { authorIds });
  revalidatePath(`/erp/catalogue/${bookId}`);
  revalidatePath("/books");
}

export async function setBookCategories(formData: FormData) {
  const { userId } = await requireStaff();
  const supabase = await createClient();

  const bookId = String(formData.get("book_id"));
  const categoryIds = formData.getAll("category_ids").map(String);

  if (!bookId) throw new Error("Book is required");

  const { error: deleteError } = await supabase
    .from("book_categories")
    .delete()
    .eq("book_id", bookId);
  if (deleteError) throw new Error(deleteError.message);

  if (categoryIds.length > 0) {
    const rows = categoryIds.map((categoryId) => ({
      book_id: bookId,
      category_id: categoryId,
    }));
    const { error } = await supabase.from("book_categories").insert(rows);
    if (error) throw new Error(error.message);
  }

  await audit(userId, "book.categories", "book", bookId, { categoryIds });
  revalidatePath(`/erp/catalogue/${bookId}`);
  revalidatePath("/books");
}

export async function unpublishBook(formData: FormData) {
  const { userId } = await requireStaff();
  const supabase = await createClient();

  const id = String(formData.get("id"));
  const { error } = await supabase
    .from("books")
    .update({ is_published: false, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await audit(userId, "book.unpublish", "book", id);
  revalidatePath(`/erp/catalogue/${id}`);
  revalidatePath("/erp/catalogue");
  revalidatePath("/books");
}

export async function markPaymentCompleted(formData: FormData) {
  const { userId } = await requireStaff();
  const supabase = await createClient();

  const id = String(formData.get("id"));
  const paidAt = new Date().toISOString();

  const { data: payment, error: fetchError } = await supabase
    .from("payments")
    .select("id, order_id")
    .eq("id", id)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const { error } = await supabase
    .from("payments")
    .update({ status: "completed", paid_at: paidAt })
    .eq("id", id);
  if (error) throw new Error(error.message);

  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", payment.order_id)
    .single();

  if (order?.status === "cod_pending") {
    await supabase
      .from("orders")
      .update({ status: "paid", updated_at: new Date().toISOString() })
      .eq("id", payment.order_id);
  }

  await audit(userId, "payment.complete", "payment", id);
  revalidatePath(`/erp/orders/${payment.order_id}`);
  revalidatePath("/erp/orders");
}

export async function inviteStaff(formData: FormData) {
  const { userId } = await requireOwner();

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. Staff invites require the service role key."
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  const email = String(formData.get("email") || "").trim();
  const fullName = String(formData.get("full_name") || "").trim();
  const role = String(formData.get("role") || "staff");

  if (!email) throw new Error("Email is required");

  const adminClient = createSupabaseAdmin(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { role, full_name: fullName },
  });
  if (error) throw new Error(error.message);

  if (data.user?.id) {
    const supabase = await createClient();
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      email,
      full_name: fullName || null,
      role,
      is_active: true,
      updated_at: new Date().toISOString(),
    });
    if (profileError) throw new Error(profileError.message);
    await audit(userId, "staff.invite", "profile", data.user.id, { email, role });
  }

  revalidatePath("/erp/staff");
}

export async function updatePublishingTitle(formData: FormData) {
  const { userId } = await requireManager();
  const supabase = await createClient();

  const id = String(formData.get("id"));
  const workingTitle = String(formData.get("working_title") || "").trim();
  if (!workingTitle) throw new Error("Working title is required");

  const { error } = await supabase
    .from("publishing_titles")
    .update({
      working_title: workingTitle,
      stage: String(formData.get("stage") || "idea"),
      editor_notes: String(formData.get("editor_notes") || "") || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await audit(userId, "publishing.update", "publishing_title", id);
  revalidatePath("/erp/publishing");
}

export async function submitPublicEnquiry(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  let message = String(formData.get("message") || "").trim();
  const bookId = String(formData.get("book_id") || "") || null;
  const bookTitle = String(formData.get("book_title") || "").trim();

  if (!name || !email || !message) {
    throw new Error("Name, email, and message are required");
  }

  if (bookTitle && !message.toLowerCase().includes(bookTitle.toLowerCase())) {
    message = `Re: ${bookTitle}\n\n${message}`;
  }

  const { error } = await supabase.from("enquiries").insert({
    name,
    email,
    phone: String(formData.get("phone") || "") || null,
    message,
    book_id: bookId,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/erp/enquiries");

  const bookSlug = String(formData.get("book_slug") || "").trim();
  if (bookSlug) {
    redirect(`/books/${bookSlug}?sent=1`);
  }
  redirect("/enquiry?sent=1");
}

/** Waterstones-style hold for pickup — structured bag → ERP queue. */
export async function submitPickupHold(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim() || null;
  const note = String(formData.get("note") || "").trim() || null;
  let items: Array<{
    book_id: string;
    title: string;
    slug?: string;
    qty: number;
    price_btn: number;
    isbn?: string | null;
  }> = [];
  try {
    items = JSON.parse(String(formData.get("items_json") || "[]"));
  } catch {
    throw new Error("Invalid hold items");
  }
  if (!name || !phone) throw new Error("Name and phone are required");
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Add at least one title to hold");
  }

  const normalized = items
    .map((i) => ({
      book_id: String(i.book_id || ""),
      title: String(i.title || "").trim(),
      slug: i.slug ? String(i.slug) : undefined,
      qty: Math.max(1, Math.min(99, Number(i.qty) || 1)),
      price_btn: Number(i.price_btn) || 0,
      isbn: i.isbn ?? null,
    }))
    .filter((i) => i.book_id && i.title);

  if (!normalized.length) throw new Error("Add at least one title to hold");

  const total = normalized.reduce((s, i) => s + i.qty * i.price_btn, 0);
  const lines = normalized
    .map(
      (i) =>
        `• ${i.title}${i.isbn ? ` (${i.isbn})` : ""} ×${i.qty} — Nu. ${(i.qty * i.price_btn).toFixed(0)}`
    )
    .join("\n");

  const { error: holdErr } = await supabase.from("pickup_holds").insert({
    name,
    phone,
    email,
    note,
    status: "new",
    items: normalized,
    total_btn: total,
  });
  if (holdErr) throw new Error(holdErr.message);

  // Also mirror into enquiries so existing staff inbox stays useful
  await supabase.from("enquiries").insert({
    name,
    email: email || `${phone.replace(/\D/g, "")}@hold.dsb.local`,
    phone,
    message: `PICKUP HOLD (48h)\n\n${lines}\n\nTotal est. Nu. ${total.toFixed(0)}${note ? `\n\nNote: ${note}` : ""}`,
    book_id: normalized[0]?.book_id || null,
  });

  revalidatePath("/erp/enquiries");
  revalidatePath("/erp/holds");
}

/** Guest back-in-stock alert (throttled unique email per book). */
export async function submitStockAlert(formData: FormData) {
  const supabase = await createClient();
  const bookId = String(formData.get("book_id") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!bookId || !email.includes("@")) {
    throw new Error("Valid email is required");
  }
  const { error } = await supabase.from("stock_alerts").upsert(
    { book_id: bookId, email, notified_at: null },
    { onConflict: "book_id,email" }
  );
  if (error) throw new Error(error.message);
}

export async function updatePickupHoldStatus(formData: FormData) {
  const { userId } = await requireStaff();
  const supabase = await createClient();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "new");
  if (!id) throw new Error("Missing hold id");
  if (!["new", "ready", "collected", "cancelled"].includes(status)) {
    throw new Error("Invalid status");
  }
  const { error } = await supabase
    .from("pickup_holds")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await audit(userId, "pickup_hold.update", "pickup_hold", id, { status });
  revalidatePath("/erp/holds");
}
