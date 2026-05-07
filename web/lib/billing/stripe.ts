import "server-only";
import Stripe from "stripe";

/**
 * Singleton Stripe SDK client. Server-only — never import from a client
 * component. Uses the locked API version below; bumping requires reviewing
 * webhook payload shapes.
 */

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error(
    "STRIPE_SECRET_KEY is not set. Add it to .env.local (see .env.example).",
  );
}

// NOTE: spec mandates apiVersion "2024-12-18.acacia". The installed Stripe SDK
// (17.5.0) types only accept the newer LatestApiVersion literal, but the older
// version is still a valid live API version on Stripe's side. Cast through
// Stripe.LatestApiVersion to satisfy the type without bumping the spec.
export const stripe = new Stripe(secretKey, {
  apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
  typescript: true,
});
