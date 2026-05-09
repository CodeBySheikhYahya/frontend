const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * US storefront: amounts shown with the dollar sign (e.g. $1,234.56).
 */
export function formatUSD(amount: number): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return usd.format(0);
  return usd.format(n);
}
