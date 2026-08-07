import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key);
  }
  return stripeSingleton;
}

/** Convert BTN amount to USD cents using store FX rate. */
export function btnToUsdCents(amountBtn: number, btnPerUsd: number): number {
  const rate = btnPerUsd > 0 ? btnPerUsd : 84;
  const usd = amountBtn / rate;
  return Math.max(50, Math.round(usd * 100));
}
