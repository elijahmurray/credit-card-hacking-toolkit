/**
 * Money formatting helpers. Rules:
 * - Whole-dollar prices → no decimals: $0, $15, $39
 * - Sub-dollar or non-whole → two decimals: $0.99, $14.50
 *
 * Input is dollars (whole-number prices in pricing.ts) by default, with a
 * cents helper for Stripe amounts.
 */

export function formatPrice(dollars: number): string {
  if (Number.isInteger(dollars)) return `$${dollars}`;
  return `$${dollars.toFixed(2)}`;
}

export function formatPriceFromCents(cents: number): string {
  return formatPrice(cents / 100);
}

export function formatMonthly(dollars: number): string {
  if (dollars === 0) return "Free";
  return `${formatPrice(dollars)}/mo`;
}
