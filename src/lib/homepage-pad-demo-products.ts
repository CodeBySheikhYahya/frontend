import type { Product } from "@/types/product.types";
import { getAllUsaDemoProducts } from "@/lib/usa-demo-catalog";

const defaultLimit = 4;

function productKey(p: Product) {
  return String(p.id);
}

/** Ensure up to `limit` products by appending USA demo catalog items not already present. */
export function padWithUsaDemoProducts(
  existing: Product[],
  limit: number = defaultLimit
): Product[] {
  const out = [...existing];
  if (out.length >= limit) return out.slice(0, limit);
  const seen = new Set(out.map(productKey));
  for (const p of getAllUsaDemoProducts()) {
    if (out.length >= limit) break;
    if (seen.has(productKey(p))) continue;
    seen.add(productKey(p));
    out.push(p);
  }
  return out.slice(0, limit);
}

/**
 * Like `padWithUsaDemoProducts`, but skips any product ids already on the page (e.g. New
 * Arrivals + On Sale) so “Top selling” does not duplicate those rows when using demo fill-in.
 */
export function padWithUsaDemoProductsExcluding(
  existing: Product[],
  limit: number = defaultLimit,
  excludeProducts: Product[] = []
): Product[] {
  const out = [...existing];
  if (out.length >= limit) return out.slice(0, limit);
  const seen = new Set([
    ...out.map(productKey),
    ...excludeProducts.map(productKey),
  ]);
  for (const p of getAllUsaDemoProducts()) {
    if (out.length >= limit) break;
    if (seen.has(productKey(p))) continue;
    seen.add(productKey(p));
    out.push(p);
  }
  return out.slice(0, limit);
}

/**
 * Same as `padWithUsaDemoProducts`, but applies a percentage discount for “on sale” display.
 * Pass `excludeProducts` (e.g. the finalized New Arrivals row) so the homepage does not reuse
 * the same USA demo SKUs in both sections when Supabase returns few rows.
 */
export function padOnSaleWithUsaDemoProducts(
  existing: Product[],
  limit: number = defaultLimit,
  excludeProducts: Product[] = []
): Product[] {
  const percents = [20, 15, 25, 18, 22, 12, 30, 16];
  const out: Product[] = [...existing];
  if (out.length >= limit) return out.slice(0, limit);
  const seen = new Set([
    ...out.map(productKey),
    ...excludeProducts.map(productKey),
  ]);
  let i = 0;
  for (const p of getAllUsaDemoProducts()) {
    if (out.length >= limit) break;
    if (seen.has(productKey(p))) continue;
    seen.add(productKey(p));
    out.push({
      ...p,
      discount: {
        percentage: percents[i % percents.length],
        amount: 0,
      },
    });
    i += 1;
  }
  return out.slice(0, limit);
}
