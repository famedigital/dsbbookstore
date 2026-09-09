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

export async function upsertBook(formData: FormData) {
  const { userId, profile } = await requireStaff();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("Title is required");

  const pageCountRaw = String(formData.get("page_count") || "").trim();
  const page_count = pageCountRaw ? Number(pageCountRaw) : null;

  const payload = {
    title,
    subtitle: String(formData.get("subtitle") || "") || null,
    slug: String(formData.get("slug") || slugify(title)),
    description: String(formData.get("description") || "") || null,
    isbn_13: String(formData.get("isbn_13") || "") || null,
    language: String(formData.get("language") || "English"),
    format: String(formData.get("format") || "paperback"),
    publisher_name: String(formData.get("publisher_name") || "DSB Publication"),
    page_count,
    price_btn: Number(formData.get("price_btn") || 0),
    cost_price_btn:
      profile.role === "staff"
        ? undefined
        : Number(formData.get("cost_price_btn") || 0),
    cover_public_id: String(formData.get("cover_public_id") || "") || null,
    is_published: formData.get("is_published") === "on",
    is_featured: formData.get("is_featured") === "on",
  };

  let bookId = id;

  if (id) {
    const { error } = await supabase.from("books").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
    await audit(userId, "book.update", "book", id, { title });
  } else {
    const { data, error } = await supabase
      .from("books")
      .insert({ ...payload, cost_price_btn: Number(formData.get("cost_price_btn") || 0) })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    bookId = data.id;
    await audit(userId, "book.create", "book", data.id, { title });
  }

  revalidatePath("/erp/catalogue");
  revalidatePath("/books");
  if (bookId) {
    revalidatePath(`/erp/catalogue/${bookId}`);
    redirect(`/erp/catalogue/${bookId}`);
  }
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
}) {
  const { userId } = await requireStaff();
  const supabase = await createClient();

  if (!input.items.length) throw new Error("Cart is empty");

  const subtotal = input.items.reduce(
    (sum, i) => sum + i.qty * i.unitPrice,
    0
  );
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

  const { error: payError } = await supabase.from("payments").insert({
    order_id: order.id,
    method: input.paymentMethod,
    status: input.paymentMethod === "cod" ? "pending" : "completed",
    amount_btn: subtotal,
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
  });

  revalidatePath("/erp/orders");
  revalidatePath("/erp/inventory");
  revalidatePath("/erp/pos");
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
  const bookId = String(formData.get("book_id"));
  const qty = Number(formData.get("qty_ordered") || 0);
  const unitCost = Number(formData.get("unit_cost_btn") || 0);

  if (!bookId || qty <= 0) throw new Error("Book and quantity required");

  const number = poNumber();
  const { data: po, error } = await supabase
    .from("purchase_orders")
    .insert({
      po_number: number,
      supplier_id: supplierId,
      status: "ordered",
      ordered_at: new Date().toISOString(),
      notes,
      created_by: userId,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const { error: itemError } = await supabase.from("purchase_order_items").insert({
    purchase_order_id: po.id,
    book_id: bookId,
    qty_ordered: qty,
    unit_cost_btn: unitCost,
  });
  if (itemError) throw new Error(itemError.message);

  await audit(userId, "po.create", "purchase_order", po.id, { po_number: number });
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

  const { data: receipt, error: grError } = await supabase
    .from("goods_receipts")
    .insert({ purchase_order_id: poId, received_by: userId })
    .select("id")
    .single();
  if (grError) throw new Error(grError.message);

  for (const item of items) {
    const remaining = item.qty_ordered - item.qty_received;
    if (remaining <= 0) continue;

    await supabase.from("goods_receipt_items").insert({
      goods_receipt_id: receipt.id,
      book_id: item.book_id,
      qty: remaining,
      unit_cost_btn: item.unit_cost_btn,
    });

    await supabase
      .from("purchase_order_items")
      .update({ qty_received: item.qty_ordered })
      .eq("id", item.id);

    await supabase.from("stock_movements").insert({
      book_id: item.book_id,
      movement_type: "purchase_in",
      qty_delta: remaining,
      reason: `Goods receipt for PO`,
      reference_type: "goods_receipt",
      reference_id: receipt.id,
      created_by: userId,
    });

    await supabase
      .from("books")
      .update({ cost_price_btn: item.unit_cost_btn })
      .eq("id", item.book_id);
  }

  await supabase
    .from("purchase_orders")
    .update({ status: "received", updated_at: new Date().toISOString() })
    .eq("id", poId);

  await audit(userId, "po.receive", "purchase_order", poId);
  revalidatePath("/erp/purchasing");
  revalidatePath("/erp/inventory");
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
  const themeRaw = String(formData.get("storefront_theme") || "uikit");
  const storefront_theme = ["uikit", "booksaw", "booketic", "atelier"].includes(
    themeRaw,
  )
    ? themeRaw
    : "uikit";

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
      storefront_theme,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/erp/settings");
  revalidatePath("/");
  revalidatePath("/books");
  revalidatePath("/authors");
  revalidatePath("/visit");
  revalidatePath("/enquiry");
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
  const message = String(formData.get("message") || "").trim();
  const bookId = String(formData.get("book_id") || "") || null;

  if (!name || !email || !message) {
    throw new Error("Name, email, and message are required");
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
