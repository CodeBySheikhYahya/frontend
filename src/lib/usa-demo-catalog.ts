import type { Product, ProductVariant } from "@/types/product.types";

const navy = { id: "srx-col-navy", name: "Navy", hex_code: "#1B2A41" };
const sand = { id: "srx-col-sand", name: "Sand", hex_code: "#D7C8B4" };
const slate = { id: "srx-col-slate", name: "Slate", hex_code: "#4A5568" };
const ivory = { id: "srx-col-ivory", name: "Ivory", hex_code: "#F5F0E8" };

const s = { id: "srx-sz-s", name: "S" };
const m = { id: "srx-sz-m", name: "M" };
const l = { id: "srx-sz-l", name: "L" };

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

/** Verified Unsplash ids (404-checked) — one image per product. */
function unsplash(id: string): string {
  return `https://images.unsplash.com/photo-${id}?w=900&q=80`;
}

const CATALOG_IMAGES: Record<string, string> = {
  "srx-mens-cotton-tshirt": unsplash("1521572163474-6864f9cf17ab"),
  "srx-classic-pocket-tee": unsplash("1602810318383-e386cc2a3ccf"),
  "srx-classic-polo-shirt": unsplash("1551028719-00167b16eac5"),
  "srx-cotton-crew-sweater": unsplash("1434389677669-e08b4cac3105"),
  "srx-casual-denim-jeans": unsplash("1543163521-1bf539c55dd2"),
  "srx-cargo-pants": unsplash("1506629082955-511b1aa562c8"),
  "srx-oversized-hoodie": unsplash("1556821840-3a63f95609a7"),
  "srx-lightweight-windbreaker": unsplash("1586790170083-2f9ceadc732d"),
  "srx-womens-sports-leggings": unsplash("1515886657613-9f3515b0c78f"),
  "srx-athletic-tank-top": unsplash("1490481651871-ab68de25d43d"),
  "srx-midi-dress": unsplash("1515372039744-b8f02a3ae446"),
  "srx-cotton-midi-skirt": unsplash("1595777457583-95e059d581b8"),
  "srx-stretch-chino-pants": unsplash("1483985988355-763728e1935b"),
  "srx-pullover-knit-sweater": unsplash("1576566588028-4147f3842f27"),
  "srx-unstructured-blazer": unsplash("1594938298603-c8148c4dae35"),
  "srx-casual-shorts": unsplash("1591195853828-11db59a44f6b"),
  "srx-running-shoes": unsplash("1460353581641-37baddab0fa2"),
  "srx-suede-loafers": unsplash("1549298916-b41d501d3772"),
  "srx-leather-sandals": unsplash("1539109136881-3be0616acf4b"),
  "srx-pool-slides": unsplash("1503341504253-dff4815485f1"),
  "srx-leather-wallet": unsplash("1572635196237-14b3f281503f"),
  "srx-baseball-cap": unsplash("1521369909029-2afed882baee"),
  "srx-canvas-tote-bag": unsplash("1590874103328-eac38a683ce7"),
  "srx-stainless-steel-watch": unsplash("1523275335684-37898b6baf30"),
};

const CATEGORY_HERO_IMAGES: Record<string, string> = {
  "mens-clothing": unsplash("1521572163474-6864f9cf17ab").replace("w=900", "w=1200"),
  "womens-clothing": unsplash("1515886657613-9f3515b0c78f").replace("w=900", "w=1200"),
  "footwear-accessories": unsplash("1460353581641-37baddab0fa2").replace("w=900", "w=1200"),
};

function catalogMedia(productId: string): Pick<Product, "srcUrl" | "gallery"> {
  const url =
    CATALOG_IMAGES[productId] ??
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=80";
  return { srcUrl: url, gallery: [url] };
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
    name: "Men's Clothing",
    slug: "mens-clothing",
    priceBand: "98.00 – 215.00 USD",
    tagline: "Private-label essentials for everyday wear — tops, bottoms, and layers.",
    heroImage: CATEGORY_HERO_IMAGES["mens-clothing"]!,
    subs: [
      {
        name: "Tops & Tees",
        slug: "tops-tees",
        priceBand: "98.00 – 189.00 USD",
        blurb: "Cotton tees, polos, and knit tops with a clean, generic fit.",
        productIds: [
          "srx-mens-cotton-tshirt",
          "srx-classic-pocket-tee",
          "srx-classic-polo-shirt",
          "srx-cotton-crew-sweater",
        ],
      },
      {
        name: "Bottoms & Outerwear",
        slug: "bottoms-outerwear",
        priceBand: "112.00 – 215.00 USD",
        blurb: "Jeans, cargo pants, hoodies, and lightweight jackets.",
        productIds: [
          "srx-casual-denim-jeans",
          "srx-cargo-pants",
          "srx-oversized-hoodie",
          "srx-lightweight-windbreaker",
        ],
      },
    ],
  },
  {
    name: "Women's Clothing",
    slug: "womens-clothing",
    priceBand: "92.00 – 298.00 USD",
    tagline: "Unbranded women's styles — activewear, dresses, and casual layers.",
    heroImage: CATEGORY_HERO_IMAGES["womens-clothing"]!,
    subs: [
      {
        name: "Activewear",
        slug: "activewear",
        priceBand: "92.00 – 249.00 USD",
        blurb: "Leggings, tanks, and dresses built for comfort and movement.",
        productIds: [
          "srx-womens-sports-leggings",
          "srx-athletic-tank-top",
          "srx-midi-dress",
          "srx-cotton-midi-skirt",
        ],
      },
      {
        name: "Casual Wear",
        slug: "casual-wear",
        priceBand: "112.00 – 298.00 USD",
        blurb: "Chinos, knits, blazers, and shorts for daily outfits.",
        productIds: [
          "srx-stretch-chino-pants",
          "srx-pullover-knit-sweater",
          "srx-unstructured-blazer",
          "srx-casual-shorts",
        ],
      },
    ],
  },
  {
    name: "Footwear & Accessories",
    slug: "footwear-accessories",
    priceBand: "96.00 – 268.00 USD",
    tagline: "Generic shoes, wallets, caps, and bags from the SRX private-label line.",
    heroImage: CATEGORY_HERO_IMAGES["footwear-accessories"]!,
    subs: [
      {
        name: "Shoes",
        slug: "shoes",
        priceBand: "96.00 – 228.00 USD",
        blurb: "Running shoes, loafers, sandals, and slides — no third-party branding.",
        productIds: [
          "srx-running-shoes",
          "srx-suede-loafers",
          "srx-leather-sandals",
          "srx-pool-slides",
        ],
      },
      {
        name: "Accessories",
        slug: "accessories",
        priceBand: "104.00 – 268.00 USD",
        blurb: "Wallets, caps, totes, and everyday add-ons.",
        productIds: [
          "srx-leather-wallet",
          "srx-baseball-cap",
          "srx-canvas-tote-bag",
          "srx-stainless-steel-watch",
        ],
      },
    ],
  },
];

const USA_DEMO_PRODUCTS: Record<string, Product> = {
  "srx-mens-cotton-tshirt": {
    id: "srx-mens-cotton-tshirt",
    title: "Men's Cotton T-Shirt",
    ...catalogMedia("srx-mens-cotton-tshirt"),
    price: 98,
    discount: noDiscount,
    rating: 4.7,
    short_description: "Soft cotton crew neck tee — a private-label staple for everyday wear.",
    description:
      "100% cotton jersey with a relaxed fit. Pre-shrunk fabric, reinforced seams, and tagless neck label. Sold under the SRX generic apparel line.",
    variants: matrixVariants([navy, sand, ivory], [s, m, l], "srx-mct"),
    size_type: "clothing",
  },
  "srx-classic-pocket-tee": {
    id: "srx-classic-pocket-tee",
    title: "Classic Pocket Tee",
    ...catalogMedia("srx-classic-pocket-tee"),
    price: 108,
    discount: noDiscount,
    rating: 4.5,
    short_description: "Garment-dyed cotton tee with a chest pocket.",
    description:
      "Midweight slub cotton with a single patch pocket. Unbranded generic style suitable for casual and layered outfits.",
    variants: matrixVariants([ivory, navy, slate], [s, m, l], "srx-cpt"),
    size_type: "clothing",
  },
  "srx-classic-polo-shirt": {
    id: "srx-classic-polo-shirt",
    title: "Classic Polo Shirt",
    ...catalogMedia("srx-classic-polo-shirt"),
    price: 128,
    discount: noDiscount,
    rating: 4.6,
    short_description: "Moisture-wicking pique polo with a structured collar.",
    description:
      "Three-button placket, side vents, and anti-curl collar. Generic private-label polo — no external brand markings.",
    variants: matrixVariants([navy, slate, sand], [s, m, l], "srx-cps"),
    size_type: "clothing",
  },
  "srx-cotton-crew-sweater": {
    id: "srx-cotton-crew-sweater",
    title: "Cotton Crew Sweater",
    ...catalogMedia("srx-cotton-crew-sweater"),
    price: 149,
    discount: noDiscount,
    rating: 4.8,
    short_description: "Midweight cotton crewneck for cool days and office layering.",
    description:
      "Ribbed cuffs and hem with a smooth knit body. Generic knitwear from the SRX essentials collection.",
    variants: matrixVariants([navy, ivory], [s, m, l], "srx-ccs"),
    size_type: "clothing",
  },
  "srx-casual-denim-jeans": {
    id: "srx-casual-denim-jeans",
    title: "Casual Denim Jeans",
    ...catalogMedia("srx-casual-denim-jeans"),
    price: 165,
    discount: noDiscount,
    rating: 4.6,
    short_description: "Straight-fit denim with classic five-pocket styling.",
    description:
      "Medium-wash cotton denim with contrast stitching. Unbranded generic jeans — no designer labels or logos.",
    variants: matrixVariants([navy, slate], [s, m, l], "srx-cdj"),
    size_type: "clothing",
  },
  "srx-cargo-pants": {
    id: "srx-cargo-pants",
    title: "Cargo Pants",
    ...catalogMedia("srx-cargo-pants"),
    price: 138,
    discount: noDiscount,
    rating: 4.5,
    short_description: "Relaxed cargo pants with multiple utility pockets.",
    description:
      "Durable cotton twill with adjustable waist tabs. Private-label utility pant with a clean, unbranded look.",
    variants: matrixVariants([slate, sand, navy], [s, m, l], "srx-cp"),
    size_type: "clothing",
  },
  "srx-oversized-hoodie": {
    id: "srx-oversized-hoodie",
    title: "Oversized Hoodie",
    ...catalogMedia("srx-oversized-hoodie"),
    price: 155,
    discount: noDiscount,
    rating: 4.5,
    short_description: "Mid-weight fleece hoodie with an oversized relaxed fit.",
    description:
      "Cotton-poly fleece with kangaroo pocket and drawcord hood. Generic streetwear silhouette — SRX private label.",
    variants: matrixVariants([slate, sand, navy], [s, m, l], "srx-oh"),
    size_type: "clothing",
  },
  "srx-lightweight-windbreaker": {
    id: "srx-lightweight-windbreaker",
    title: "Lightweight Windbreaker",
    ...catalogMedia("srx-lightweight-windbreaker"),
    price: 175,
    discount: noDiscount,
    rating: 4.6,
    short_description: "Packable nylon shell with mesh lining.",
    description:
      "Wind-resistant ripstop jacket with zip pockets and elastic cuffs. Unbranded outerwear for daily commutes.",
    variants: matrixVariants([navy, slate], [s, m, l], "srx-lw"),
    size_type: "clothing",
  },
  "srx-womens-sports-leggings": {
    id: "srx-womens-sports-leggings",
    title: "Women's Sports Leggings",
    ...catalogMedia("srx-womens-sports-leggings"),
    price: 92,
    discount: noDiscount,
    rating: 4.9,
    short_description: "High-rise leggings with four-way stretch for training and leisure.",
    description:
      "Moisture-wicking knit with flatlock seams and wide waistband. Generic activewear — no third-party branding.",
    variants: matrixVariants([navy, slate, ivory], [s, m, l], "srx-wsl"),
    size_type: "clothing",
  },
  "srx-athletic-tank-top": {
    id: "srx-athletic-tank-top",
    title: "Athletic Tank Top",
    ...catalogMedia("srx-athletic-tank-top"),
    price: 68,
    discount: noDiscount,
    rating: 4.5,
    short_description: "Breathable racerback tank for workouts and warm weather.",
    description:
      "Lightweight performance fabric with a relaxed arm opening. Private-label generic tank top.",
    variants: matrixVariants([ivory, navy, slate], [s, m, l], "srx-att"),
    size_type: "clothing",
  },
  "srx-midi-dress": {
    id: "srx-midi-dress",
    title: "Midi Dress",
    ...catalogMedia("srx-midi-dress"),
    price: 149,
    discount: noDiscount,
    rating: 4.7,
    short_description: "Lined midi dress with a clean A-line silhouette.",
    description:
      "Soft viscose blend with side slits and hidden zip. Unbranded dress from the SRX women's collection.",
    variants: matrixVariants([ivory, navy], [s, m, l], "srx-md"),
    size_type: "clothing",
  },
  "srx-cotton-midi-skirt": {
    id: "srx-cotton-midi-skirt",
    title: "Cotton Midi Skirt",
    ...catalogMedia("srx-cotton-midi-skirt"),
    price: 118,
    discount: noDiscount,
    rating: 4.4,
    short_description: "A-line cotton skirt with an elastic waistband.",
    description:
      "Breathable cotton twill in a mid-calf length. Generic skirt with no external brand labels.",
    variants: matrixVariants([sand, ivory, navy], [s, m, l], "srx-cms"),
    size_type: "clothing",
  },
  "srx-stretch-chino-pants": {
    id: "srx-stretch-chino-pants",
    title: "Stretch Chino Pants",
    ...catalogMedia("srx-stretch-chino-pants"),
    price: 128,
    discount: noDiscount,
    rating: 4.6,
    short_description: "Four-way stretch chinos with a tapered leg.",
    description:
      "Cotton-blend twill with grip waistband and pressed crease. Private-label trouser for work and weekends.",
    variants: matrixVariants([navy, slate, sand], [s, m, l], "srx-scp"),
    size_type: "clothing",
  },
  "srx-pullover-knit-sweater": {
    id: "srx-pullover-knit-sweater",
    title: "Pullover Knit Sweater",
    ...catalogMedia("srx-pullover-knit-sweater"),
    price: 139,
    discount: noDiscount,
    rating: 4.7,
    short_description: "Midweight pullover with a soft brushed interior.",
    description:
      "Garment-dyed cotton blend with ribbed neckline. Generic knit — sold exclusively under SRX.",
    variants: matrixVariants([sand, ivory, slate], [s, m, l], "srx-pks"),
    size_type: "clothing",
  },
  "srx-unstructured-blazer": {
    id: "srx-unstructured-blazer",
    title: "Unstructured Blazer",
    ...catalogMedia("srx-unstructured-blazer"),
    price: 198,
    discount: noDiscount,
    rating: 4.8,
    short_description: "Relaxed blazer with patch pockets and partial lining.",
    description:
      "Lightweight woven fabric with horn-style buttons. Unbranded tailoring from the SRX workwear edit.",
    variants: matrixVariants([navy, slate], [s, m, l], "srx-ub"),
    size_type: "clothing",
  },
  "srx-casual-shorts": {
    id: "srx-casual-shorts",
    title: "Casual Shorts",
    ...catalogMedia("srx-casual-shorts"),
    price: 88,
    discount: noDiscount,
    rating: 4.5,
    short_description: "Cotton shorts with an elastic-back waist and drawcord.",
    description:
      "Classic above-knee length in breathable cotton. Generic summer short — no logos or brand tags.",
    variants: matrixVariants([ivory, navy, sand], [s, m, l], "srx-cs"),
    size_type: "clothing",
  },
  "srx-running-shoes": {
    id: "srx-running-shoes",
    title: "Running Shoes",
    ...catalogMedia("srx-running-shoes"),
    price: 128,
    discount: noDiscount,
    rating: 4.7,
    short_description: "Lightweight running shoes with cushioned midsole.",
    description:
      "Breathable mesh upper with rubber outsole. Generic athletic footwear — private-label, no famous brand marks.",
    variants: matrixVariants([ivory, navy, slate], [s, m, l], "srx-rs"),
    size_type: "shoes",
  },
  "srx-suede-loafers": {
    id: "srx-suede-loafers",
    title: "Suede Loafers",
    ...catalogMedia("srx-suede-loafers"),
    price: 168,
    discount: noDiscount,
    rating: 4.6,
    short_description: "Soft suede loafers with a flexible rubber sole.",
    description:
      "Unlined moccasin construction with pebble sole for grip. Generic casual shoe from SRX footwear.",
    variants: matrixVariants([sand, slate, navy], [s, m, l], "srx-sl"),
    size_type: "shoes",
  },
  "srx-leather-sandals": {
    id: "srx-leather-sandals",
    title: "Leather Sandals",
    ...catalogMedia("srx-leather-sandals"),
    price: 112,
    discount: noDiscount,
    rating: 4.4,
    short_description: "Cushioned leather sandals with adjustable straps.",
    description:
      "Burnished leather straps over a contoured footbed. Unbranded warm-weather sandal.",
    variants: matrixVariants([sand, slate], [s, m, l], "srx-lsd"),
    size_type: "shoes",
  },
  "srx-pool-slides": {
    id: "srx-pool-slides",
    title: "Pool Slides",
    ...catalogMedia("srx-pool-slides"),
    price: 96,
    discount: noDiscount,
    rating: 4.3,
    short_description: "Contoured EVA slides with a wide single strap.",
    description:
      "Rinse-friendly pool and shower slide with antimicrobial footbed liner. Generic private-label footwear.",
    variants: matrixVariants([slate, ivory, navy], [s, m, l], "srx-ps"),
    size_type: "shoes",
  },
  "srx-leather-wallet": {
    id: "srx-leather-wallet",
    title: "Leather Wallet",
    ...catalogMedia("srx-leather-wallet"),
    price: 68,
    discount: noDiscount,
    rating: 4.4,
    short_description: "Full-grain leather bifold wallet with card slots.",
    description:
      "Vegetable-tanned leather with brushed metal hardware. Unbranded accessory — SRX private label.",
    variants: matrixVariants([sand, slate, navy], [s, m, l], "srx-lw"),
    size_type: "bags",
  },
  "srx-baseball-cap": {
    id: "srx-baseball-cap",
    title: "Baseball Cap",
    ...catalogMedia("srx-baseball-cap"),
    price: 42,
    discount: noDiscount,
    rating: 4.2,
    short_description: "Cotton twill cap with adjustable back strap.",
    description:
      "Structured six-panel cap with curved brim. Plain generic cap — no sports team or brand embroidery.",
    variants: matrixVariants([navy, sand, slate], [s, m, l], "srx-bc"),
    size_type: "clothing",
  },
  "srx-canvas-tote-bag": {
    id: "srx-canvas-tote-bag",
    title: "Canvas Tote Bag",
    ...catalogMedia("srx-canvas-tote-bag"),
    price: 78,
    discount: noDiscount,
    rating: 4.3,
    short_description: "Heavy canvas tote with interior zip pocket.",
    description:
      "18oz cotton canvas with reinforced handles and flat base. Generic carry-all bag from SRX accessories.",
    variants: matrixVariants([sand, slate, ivory], [s, m, l], "srx-ctb"),
    size_type: "bags",
  },
  "srx-stainless-steel-watch": {
    id: "srx-stainless-steel-watch",
    title: "Stainless Steel Watch",
    ...catalogMedia("srx-stainless-steel-watch"),
    price: 148,
    discount: noDiscount,
    rating: 4.7,
    short_description: "Brushed steel case with leather strap and date window.",
    description:
      "Quartz movement with mineral crystal and 50m water resistance. Generic timepiece — no luxury brand markings.",
    variants: matrixVariants([slate, navy, sand], [s, m, l], "srx-ssw"),
    size_type: "clothing",
  },
};

export function isCatalogProductId(id: string | number): boolean {
  return String(id).startsWith("srx-");
}

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
