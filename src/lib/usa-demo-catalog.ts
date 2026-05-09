import type { Product, ProductVariant } from "@/types/product.types";

const navy = { id: "usa-col-navy", name: "Navy", hex_code: "#1B2A41" };
const sand = { id: "usa-col-sand", name: "Sand", hex_code: "#D7C8B4" };
const slate = { id: "usa-col-slate", name: "Slate", hex_code: "#4A5568" };
const ivory = { id: "usa-col-ivory", name: "Ivory", hex_code: "#F5F0E8" };

const s = { id: "usa-sz-s", name: "S" };
const m = { id: "usa-sz-m", name: "M" };
const l = { id: "usa-sz-l", name: "L" };

function matrixVariants(
  colors: { id: string; name: string; hex_code: string }[],
  sizes: { id: string; name: string }[],
  prefix: string
): ProductVariant[] {
  const out: ProductVariant[] = [];
  let i = 0;
  for (const c of colors) {
    for (const sz of sizes) {
      i += 1;
      out.push({
        id: `${prefix}-v-${i}`,
        stock_quantity: 10,
        is_active: true,
        color: c,
        size: sz,
      });
    }
  }
  return out;
}

/**
 * Curated Unsplash photo ids that still resolve on `images.unsplash.com` (many
 * legacy ids 404). Each product uses a different subset so galleries feel real.
 */
const DEMO_PHOTOS = [
  "1602810318383-e386cc2a3ccf",
  "1551028719-00167b16eac5",
  "1595777457583-95e059d581b8",
  "1576566588028-4147f3842f27",
  "1591195853828-11db59a44f6b",
  "1473966968600-fa801b869a1a",
  "1590874103328-eac38a683ce7",
  "1586790170083-2f9ceadc732d",
  "1556821840-3a63f95609a7",
  "1543163521-1bf539c55dd2",
  "1521369909029-2afed882baee",
  "1509631179647-0177331693ae",
  "1490111718993-d98654ce6cf7",
  "1469334031218-e382a71b716b",
  "1441986300917-64674bd600d8",
  "1523381210434-271e8be1f52b",
  "1490481651871-ab68de25d43d",
  "1483985988355-763728e1935b",
  "1542272604-787c3835535d",
  "1539109136881-3be0616acf4b",
  "1434389677669-e08b4cac3105",
  "1445205170230-053b83016050",
  "1515886657613-9f3515b0c78f",
  "1549298916-b41d501d3772",
  "1460353581641-37baddab0fa2",
  "1506629082955-511b1aa562c8",
  "1503341504253-dff4815485f1",
  "1542291026-7eec264c27ff",
  "1572635196237-14b3f281503f",
  "1507679799987-c73779587ccf",
  "1553062407-98eeb64c6a62",
  "1521572163474-6864f9cf17ab",
] as const;

function photo(id: string): string {
  return `https://images.unsplash.com/photo-${id}?w=900&q=80`;
}

function media(...unsplashIds: string[]): Pick<Product, "srcUrl" | "gallery"> {
  const gallery = unsplashIds.map(photo);
  return { srcUrl: gallery[0]!, gallery };
}

/** Map pool indices → multi-image product media (4–5 distinct photos per SKU). */
function mediaPick(
  a: number,
  b: number,
  c: number,
  d: number,
  e?: number
): Pick<Product, "srcUrl" | "gallery"> {
  const ix = e === undefined ? [a, b, c, d] : [a, b, c, d, e];
  const ids = ix.map((i) => DEMO_PHOTOS[i]!);
  return media(...ids);
}

const noDiscount = { amount: 0, percentage: 0 };

export type UsaDemoSubcategory = {
  name: string;
  slug: string;
  priceBand: string;
  blurb: string;
  productIds: string[];
};

export type UsaDemoParent = {
  name: string;
  slug: string;
  priceBand: string;
  tagline: string;
  heroImage: string;
  subs: UsaDemoSubcategory[];
};

export const USA_DEMO_PARENTS: UsaDemoParent[] = [
  {
    name: "West Coast Living",
    slug: "west-coast-living",
    priceBand: "98.00 – 215.00 USD",
    tagline: "Relaxed layers inspired by California & Pacific Northwest streets.",
    heroImage:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=80",
    subs: [
      {
        name: "Coastal Casuals",
        slug: "coastal-casuals",
        priceBand: "98.00 – 178.00 USD",
        blurb: "Breezy shirts, tees, and light jackets for foggy mornings.",
        productIds: [
          "usa-wc-malibu-linen-shirt",
          "usa-wc-venice-slub-pocket-tee",
          "usa-wc-santa-cruz-jacket",
          "usa-wc-carmel-court-sneaker",
        ],
      },
      {
        name: "Metro Layering",
        slug: "metro-layering",
        priceBand: "128.00 – 215.00 USD",
        blurb: "City commutes: polos, hoodies, knits, and performance layers.",
        productIds: [
          "usa-wc-san-diego-performance-polo",
          "usa-wc-seattle-merino-crew",
          "usa-wc-portland-hoodie",
          "usa-wc-oakland-nylon-track-jacket",
        ],
      },
    ],
  },
  {
    name: "American Heritage",
    slug: "american-heritage",
    priceBand: "118.00 – 298.00 USD",
    tagline: "Workweek polish and weekend ease — made for USA closets.",
    heroImage:
      "https://images.unsplash.com/photo-1490111718993-d98654ce6cf7?w=1200&q=80",
    subs: [
      {
        name: "Workweek Edit",
        slug: "workweek-edit",
        priceBand: "118.00 – 298.00 USD",
        blurb: "Chinos, leather, tailoring, and boardroom-ready staples.",
        productIds: [
          "usa-ah-chicago-chinos",
          "usa-ah-denver-leather-belt",
          "usa-ah-philly-hopsack-blazer",
          "usa-ah-detroit-steel-chronograph",
        ],
      },
      {
        name: "Weekend Ease",
        slug: "weekend-ease",
        priceBand: "128.00 – 228.00 USD",
        blurb: "Soft knits, polos, and easy drivers for Saturday markets.",
        productIds: [
          "usa-ah-nashville-polo",
          "usa-ah-austin-knit",
          "usa-ah-savannah-suede-driver",
        ],
      },
    ],
  },
  {
    name: "Sunbelt & Resort",
    slug: "sunbelt-resort",
    priceBand: "92.00 – 289.00 USD",
    tagline: "Heat-friendly fabrics from Miami patios to desert sunsets.",
    heroImage:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80",
    subs: [
      {
        name: "Vacation Dressing",
        slug: "vacation-dressing",
        priceBand: "168.00 – 289.00 USD",
        blurb: "Dresses, wraps, and resort bags for coastal getaways.",
        productIds: [
          "usa-sb-charleston-dress",
          "usa-sb-naples-linen-sarong",
          "usa-sb-key-west-tote",
          "usa-sb-miami-raffia-clutch",
        ],
      },
      {
        name: "Warm-Weather Basics",
        slug: "warm-weather-basics",
        priceBand: "92.00 – 168.00 USD",
        blurb: "Shorts, slides, sandals, and sun-ready accessories.",
        productIds: [
          "usa-sb-palm-springs-shorts",
          "usa-sb-aspen-swim-volley",
          "usa-sb-scottsdale-sandals",
          "usa-sb-miami-pool-slide",
          "usa-sb-sedona-hat",
        ],
      },
    ],
  },
];

const USA_DEMO_PRODUCTS: Record<string, Product> = {
  "usa-wc-malibu-linen-shirt": {
    id: "usa-wc-malibu-linen-shirt",
    title: "Malibu Linen Shirt",
    ...mediaPick(0, 31, 7, 15, 16),
    price: 129,
    discount: noDiscount,
    rating: 4.7,
    short_description:
      "Breathable linen blend — tailored for California evenings. Ships within the continental USA.",
    description:
      "Lightweight linen-viscose blend with mother-of-pearl buttons. Designed for warm coastal climates across the USA.",
    variants: matrixVariants([navy, sand], [s, m, l], "usa-wc-malibu"),
    size_type: "clothing",
  },
  "usa-wc-venice-slub-pocket-tee": {
    id: "usa-wc-venice-slub-pocket-tee",
    title: "Venice Slub Pocket Tee",
    ...mediaPick(31, 16, 21, 22),
    price: 98,
    discount: noDiscount,
    rating: 4.5,
    short_description:
      "Garment-dyed cotton slub with a chest pocket — boardwalk to backyard BBQ.",
    description:
      "Pre-shrunk USA-cut body. Reinforced shoulder seams; tagless neck for all-day comfort.",
    variants: matrixVariants([ivory, navy, slate], [s, m, l], "usa-wc-ven"),
    size_type: "clothing",
  },
  "usa-wc-santa-cruz-jacket": {
    id: "usa-wc-santa-cruz-jacket",
    title: "Santa Cruz Denim Jacket",
    ...mediaPick(1, 18, 17, 14, 13),
    price: 165,
    discount: noDiscount,
    rating: 4.6,
    short_description:
      "Classic indigo rinse with USA-milled hardware and contrast stitching.",
    description:
      "Relaxed fit denim jacket. Layer over tees from San Diego to Seattle.",
    variants: matrixVariants([navy, slate], [s, m, l], "usa-wc-sc"),
    size_type: "clothing",
  },
  "usa-wc-carmel-court-sneaker": {
    id: "usa-wc-carmel-court-sneaker",
    title: "Carmel Court Sneaker",
    ...mediaPick(23, 24, 9, 27, 25),
    price: 178,
    discount: noDiscount,
    rating: 4.7,
    short_description:
      "Low-profile leather cupsole — walks the Embarcadero or gallery openings.",
    description:
      "Cushioned footbed, rubber outsole, and full-grain upper. Whole sizes; half sizes order up.",
    variants: matrixVariants([ivory, navy, slate], [s, m, l], "usa-wc-car"),
    size_type: "shoes",
  },
  "usa-wc-san-diego-performance-polo": {
    id: "usa-wc-san-diego-performance-polo",
    title: "San Diego Performance Polo",
    ...mediaPick(7, 0, 19, 22),
    price: 128,
    discount: noDiscount,
    rating: 4.6,
    short_description:
      "Moisture-wicking pique with UV-aware weave — golf to rooftop happy hour.",
    description:
      "Three-button placket, side vents, and anti-curl collar. Machine wash cold; tumble low.",
    variants: matrixVariants([navy, slate, sand], [s, m, l], "usa-wc-sd"),
    size_type: "clothing",
  },
  "usa-wc-seattle-merino-crew": {
    id: "usa-wc-seattle-merino-crew",
    title: "Seattle Merino Crew",
    ...mediaPick(3, 20, 21, 16),
    price: 189,
    discount: noDiscount,
    rating: 4.8,
    short_description:
      "Fine merino crewneck — ideal for cool PNW mornings and office AC.",
    description:
      "RWS-certified merino wool. Temperature-regulating for USA metro climates.",
    variants: matrixVariants([navy, ivory], [s, m, l], "usa-wc-sea"),
    size_type: "clothing",
  },
  "usa-wc-portland-hoodie": {
    id: "usa-wc-portland-hoodie",
    title: "Portland Tech Hoodie",
    ...mediaPick(8, 26, 25, 15),
    price: 155,
    discount: noDiscount,
    rating: 4.5,
    short_description:
      "Mid-weight fleece with zip pockets — bike-to-work ready.",
    description:
      "Cotton-poly fleece with water-resistant zip pockets. Sized for USA unisex fit.",
    variants: matrixVariants([slate, sand], [s, m, l], "usa-wc-pdx"),
    size_type: "clothing",
  },
  "usa-wc-oakland-nylon-track-jacket": {
    id: "usa-wc-oakland-nylon-track-jacket",
    title: "Oakland Nylon Track Jacket",
    ...mediaPick(17, 30, 3, 29, 8),
    price: 215,
    discount: noDiscount,
    rating: 4.6,
    short_description:
      "Matte ripstop shell with mesh lining — BART commutes and evening runs.",
    description:
      "Packable hood, reflective zip pulls, and zippered hand pockets. Wind-resistant DWR coating.",
    variants: matrixVariants([navy, slate], [s, m, l], "usa-wc-oak"),
    size_type: "clothing",
  },
  "usa-ah-chicago-chinos": {
    id: "usa-ah-chicago-chinos",
    title: "Chicago Stretch Chinos",
    ...mediaPick(5, 25, 4, 18),
    price: 198,
    discount: noDiscount,
    rating: 4.6,
    short_description:
      "Four-way stretch twill — sharp for Midwest offices and dinners out.",
    description:
      "Tapered leg with grip waistband. Pressed crease holds through USA travel days.",
    variants: matrixVariants([navy, slate], [s, m, l], "usa-ah-chi"),
    size_type: "clothing",
  },
  "usa-ah-denver-leather-belt": {
    id: "usa-ah-denver-leather-belt",
    title: "Denver Full-Grain Belt",
    ...mediaPick(18, 6, 30, 26),
    price: 118,
    discount: noDiscount,
    rating: 4.4,
    short_description:
      "Vegetable-tanned leather with brushed nickel buckle — USA sizing chart inside.",
    description:
      "Cut-to-fit instructions included. Pairs with denim or dress trousers nationwide.",
    variants: matrixVariants([sand, slate], [s, m, l], "usa-ah-den"),
    size_type: "clothing",
  },
  "usa-ah-philly-hopsack-blazer": {
    id: "usa-ah-philly-hopsack-blazer",
    title: "Philadelphia Hopsack Blazer",
    ...mediaPick(29, 19, 16, 22, 17),
    price: 298,
    discount: noDiscount,
    rating: 4.8,
    short_description:
      "Unstructured hopsack weave — breathable for East Coast humidity and AC.",
    description:
      "Patch pockets, partial lining, and genuine horn buttons. Tailored in a modern USA silhouette.",
    variants: matrixVariants([navy, slate], [s, m, l], "usa-ah-phl"),
    size_type: "clothing",
  },
  "usa-ah-detroit-steel-chronograph": {
    id: "usa-ah-detroit-steel-chronograph",
    title: "Detroit Steel Chronograph",
    ...mediaPick(27, 23, 9, 28, 12),
    price: 268,
    discount: noDiscount,
    rating: 4.7,
    short_description:
      "Brushed steel case, sapphire crystal, and USA-assembled quartz movement.",
    description:
      "100m water resistance, date window, and quick-release leather strap included in box.",
    variants: matrixVariants([slate, navy, sand], [s, m, l], "usa-ah-det"),
    size_type: "clothing",
  },
  "usa-ah-nashville-polo": {
    id: "usa-ah-nashville-polo",
    title: "Nashville Pima Polo",
    ...mediaPick(7, 0, 31, 19),
    price: 135,
    discount: noDiscount,
    rating: 4.5,
    short_description:
      "Ultra-soft pima cotton — concerts, patios, and road trips across the South.",
    description:
      "Rib collar holds shape after USA domestic laundry cycles.",
    variants: matrixVariants([ivory, navy], [s, m, l], "usa-ah-nash"),
    size_type: "clothing",
  },
  "usa-ah-austin-knit": {
    id: "usa-ah-austin-knit",
    title: "Austin Cotton Crew",
    ...mediaPick(3, 0, 20, 21, 31),
    price: 149,
    discount: noDiscount,
    rating: 4.7,
    short_description:
      "Midweight organic cotton — music city nights and Hill Country mornings.",
    description:
      "Garment-dyed for subtle variation. Ethically sewn for USA retail partners.",
    variants: matrixVariants([sand, ivory], [s, m, l], "usa-ah-atx"),
    size_type: "clothing",
  },
  "usa-ah-savannah-suede-driver": {
    id: "usa-ah-savannah-suede-driver",
    title: "Savannah Suede Driver",
    ...mediaPick(9, 23, 24, 27),
    price: 228,
    discount: noDiscount,
    rating: 4.6,
    short_description:
      "Unlined suede moccasin construction — porches, docks, and cobblestone streets.",
    description:
      "Rubber pebble sole for grip. Use a suede brush; store with shoe trees for shape.",
    variants: matrixVariants([sand, slate, navy], [s, m, l], "usa-ah-sav"),
    size_type: "shoes",
  },
  "usa-sb-charleston-dress": {
    id: "usa-sb-charleston-dress",
    title: "Charleston Midi Dress",
    ...mediaPick(2, 16, 19, 22, 17),
    price: 249,
    discount: noDiscount,
    rating: 4.9,
    short_description:
      "Lined midi with side slits — garden parties from SC to CA wine country.",
    description:
      "Breathable viscose crepe. Dry-clean friendly for USA formal-resort dress codes.",
    variants: matrixVariants([ivory, navy], [s, m, l], "usa-sb-chs"),
    size_type: "clothing",
  },
  "usa-sb-naples-linen-sarong": {
    id: "usa-sb-naples-linen-sarong",
    title: "Naples Linen Sarong",
    ...mediaPick(13, 16, 2, 26),
    price: 168,
    discount: noDiscount,
    rating: 4.5,
    short_description:
      "Lightweight linen blend wrap — pool deck to sunset dinner on the Gulf.",
    description:
      "Fringe-free hem, hidden side tie, and packable into a beach tote.",
    variants: matrixVariants([ivory, sand, navy], [s, m, l], "usa-sb-nap"),
    size_type: "clothing",
  },
  "usa-sb-key-west-tote": {
    id: "usa-sb-key-west-tote",
    title: "Key West Canvas Tote",
    ...mediaPick(6, 30, 29, 5),
    price: 189,
    discount: noDiscount,
    rating: 4.3,
    short_description:
      "Heavy 18oz canvas, USA-printed straps — beach to farmers market.",
    description:
      "Interior zip pocket and reinforced base. Sized for domestic carry-on personal item.",
    variants: matrixVariants([sand, slate], [s, m, l], "usa-sb-kw"),
    size_type: "bags",
  },
  "usa-sb-miami-raffia-clutch": {
    id: "usa-sb-miami-raffia-clutch",
    title: "Miami Raffia Clutch",
    ...mediaPick(30, 6, 26, 14),
    price: 142,
    discount: noDiscount,
    rating: 4.4,
    short_description:
      "Structured raffia weave with magnetic closure — resort dress codes, done.",
    description:
      "Fits phone, keys, card case, and slim sunscreen. Spot-clean woven exterior only.",
    variants: matrixVariants([sand, ivory, slate], [s, m, l], "usa-sb-mia"),
    size_type: "bags",
  },
  "usa-sb-palm-springs-shorts": {
    id: "usa-sb-palm-springs-shorts",
    title: "Palm Springs Seersucker Shorts",
    ...mediaPick(4, 5, 25, 18),
    price: 112,
    discount: noDiscount,
    rating: 4.5,
    short_description:
      "Classic seersucker stripe — desert heat tested, poolside approved.",
    description:
      "Elastic-back waist with drawcord. Inseam tailored for USA standard short lengths.",
    variants: matrixVariants([ivory, navy], [s, m, l], "usa-sb-ps"),
    size_type: "clothing",
  },
  "usa-sb-aspen-swim-volley": {
    id: "usa-sb-aspen-swim-volley",
    title: "Aspen Swim Volley",
    ...mediaPick(26, 4, 5, 12),
    price: 92,
    discount: noDiscount,
    rating: 4.4,
    short_description:
      "Quick-dry microfiber with mesh brief — lakes, pools, and hotel spas.",
    description:
      "Zip back pocket for cards. 7 inseam; drawcord waist with metal tips.",
    variants: matrixVariants([navy, slate, ivory], [s, m, l], "usa-sb-asp"),
    size_type: "clothing",
  },
  "usa-sb-scottsdale-sandals": {
    id: "usa-sb-scottsdale-sandals",
    title: "Scottsdale Leather Sandals",
    ...mediaPick(9, 23, 27, 24),
    price: 139,
    discount: noDiscount,
    rating: 4.4,
    short_description:
      "Cushioned footbed with burnished straps — resort towns coast to coast.",
    description:
      "True-to-size USA whole sizes. Leather softens with wear in warm climates.",
    variants: matrixVariants([sand, slate], [s, m, l], "usa-sb-sdz"),
    size_type: "shoes",
  },
  "usa-sb-miami-pool-slide": {
    id: "usa-sb-miami-pool-slide",
    title: "Miami Pool Slide",
    ...mediaPick(27, 23, 24, 20),
    price: 96,
    discount: noDiscount,
    rating: 4.3,
    short_description:
      "Contoured EVA footbed with wide strap — cabana to city block.",
    description:
      "Rinse-friendly; antimicrobial footbed liner. Whole sizes only.",
    variants: matrixVariants([slate, ivory, navy], [s, m, l], "usa-sb-mps"),
    size_type: "shoes",
  },
  "usa-sb-sedona-hat": {
    id: "usa-sb-sedona-hat",
    title: "Sedona Packable Hat",
    ...mediaPick(10, 28, 26, 11),
    price: 104,
    discount: noDiscount,
    rating: 4.2,
    short_description:
      "Wide brim UPF fabric — folds into your carry-on for USA domestic hops.",
    description:
      "Adjustable inner band. Spot-clean; designed for high-sun regions.",
    variants: matrixVariants([sand, ivory], [s, m, l], "usa-sb-sed"),
    size_type: "clothing",
  },
};

export function getUsaDemoParent(slug: string): UsaDemoParent | undefined {
  return USA_DEMO_PARENTS.find((p) => p.slug === slug);
}

export function getUsaDemoSub(
  parentSlug: string,
  childSlug: string
): UsaDemoSubcategory | undefined {
  const p = getUsaDemoParent(parentSlug);
  return p?.subs.find((s) => s.slug === childSlug);
}

export function getUsaDemoProductById(id: string): Product | undefined {
  return USA_DEMO_PRODUCTS[id];
}

export function getUsaDemoProductsByIds(ids: string[]): Product[] {
  return ids
    .map((id) => USA_DEMO_PRODUCTS[id])
    .filter((p): p is Product => Boolean(p));
}

export function getUsaDemoProductsForParent(parentSlug: string): Product[] {
  const p = getUsaDemoParent(parentSlug);
  if (!p) return [];
  const ids = p.subs.flatMap((s) => s.productIds);
  return getUsaDemoProductsByIds(ids);
}

export function getUsaDemoProductsForSub(
  parentSlug: string,
  childSlug: string
): Product[] {
  const sub = getUsaDemoSub(parentSlug, childSlug);
  if (!sub) return [];
  return getUsaDemoProductsByIds(sub.productIds);
}

export function getAllUsaDemoProducts(): Product[] {
  return Object.values(USA_DEMO_PRODUCTS);
}

export function usaDemoProductPath(product: Product): string {
  const slug = String(product.title).split(" ").join("-");
  return `/usa-shop/item/${product.id}/${slug}`;
}
