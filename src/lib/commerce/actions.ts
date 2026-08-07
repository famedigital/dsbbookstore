"use server";

import { redirect } from "next/navigation";
import { createOnlineOrder } from "@/lib/commerce/orders";
import { btnToUsdCents, getStripe } from "@/lib/commerce/stripe";
import { getStoreSettingsPublic, listShippingZones } from "@/lib/cms/get-page";
import { getSiteUrl } from "@/lib/storefront/site";
import type { PaymentMethod } from "@/types/erp";

function parseLines(formData: FormData) {
  const raw = String(formData.get("cart_json") || "[]");
  const parsed = JSON.parse(raw) as { bookId: string; qty: number }[];
  if (!Array.isArray(parsed) || !parsed.length) {
    throw new Error("Cart is empty");
  }
  return parsed
    .filter((l) => l.bookId && Number(l.qty) > 0)
    .map((l) => ({ bookId: l.bookId, qty: Number(l.qty) }));
}

export async function placeOnlineOrder(formData: FormData) {
  const settings = await getStoreSettingsPublic();
  if (!settings.online_checkout_enabled) {
    throw new Error("Online checkout is not enabled");
  }

  const lines = parseLines(formData);
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const zoneCode = String(formData.get("zone_code") || "pickup");
  let paymentMethod = String(
    formData.get("payment_method") || "cod"
  ) as PaymentMethod;

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Name and a valid email are required");
  }

  if (zoneCode === "international") {
    paymentMethod = "card";
  }

  const shippingAddress =
    zoneCode === "pickup"
      ? null
      : {
          line1: String(formData.get("address_line1") || "").trim() || undefined,
          line2: String(formData.get("address_line2") || "").trim() || undefined,
          city: String(formData.get("city") || "").trim() || undefined,
          region: String(formData.get("region") || "").trim() || undefined,
          postcode: String(formData.get("postcode") || "").trim() || undefined,
          country:
            String(formData.get("country") || "").trim() ||
            (zoneCode === "bhutan" ? "Bhutan" : undefined),
        };

  if (zoneCode === "international") {
    if (
      !shippingAddress?.line1 ||
      !shippingAddress?.city ||
      !shippingAddress?.country
    ) {
      throw new Error("International shipping requires address, city, and country");
    }
  }

  const order = await createOnlineOrder({
    lines,
    contact: { name, email, phone: phone || undefined },
    zoneCode,
    paymentMethod,
    shippingAddress,
    notes: String(formData.get("notes") || "") || null,
  });

  if (paymentMethod === "card") {
    return createStripeCheckoutSessionForOrder(
      order.id,
      order.order_number,
      order.total_btn
    );
  }

  redirect(`/checkout/success?order=${encodeURIComponent(order.order_number)}`);
}

async function createStripeCheckoutSessionForOrder(
  orderId: string,
  orderNumber: string,
  totalBtn: number
) {
  const settings = await getStoreSettingsPublic();
  if (!settings.stripe_enabled) {
    throw new Error("Card payments are not enabled");
  }

  const stripe = getStripe();
  const siteUrl = getSiteUrl();
  const btnPerUsd = Number(settings.btn_per_usd ?? 84);
  const amountCents = btnToUsdCents(totalBtn, btnPerUsd);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${siteUrl}/checkout/success?order=${encodeURIComponent(orderNumber)}`,
    cancel_url: `${siteUrl}/checkout?cancelled=1`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name: `DSB Books ${orderNumber}`,
            description: `Order total Nu. ${totalBtn.toFixed(0)} (≈ USD at ${btnPerUsd} BTN/USD)`,
          },
        },
      },
    ],
    metadata: {
      order_id: orderId,
      order_number: orderNumber,
    },
  });

  if (!session.url) throw new Error("Stripe session missing URL");
  redirect(session.url);
}

export async function createStripeCheckoutSession(formData: FormData) {
  const settings = await getStoreSettingsPublic();
  if (!settings.online_checkout_enabled || !settings.stripe_enabled) {
    throw new Error("Stripe checkout is not enabled");
  }

  // Allow placing order + Stripe in one step via placeOnlineOrder path
  formData.set("payment_method", "card");
  return placeOnlineOrder(formData);
}

export async function getCheckoutBootstrap() {
  const [settings, zones] = await Promise.all([
    getStoreSettingsPublic(),
    listShippingZones(),
  ]);
  return { settings, zones };
}
