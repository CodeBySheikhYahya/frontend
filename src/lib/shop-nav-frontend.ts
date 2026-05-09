import type { NavMenu } from "@/components/layout/Navbar/navbar.types";
import { USA_DEMO_PARENTS } from "@/lib/usa-demo-catalog";

/** Shop mega-menu: parents + subs — all `/usa-shop/...`, no Supabase. */
export function getFrontendShopMenuListChildren() {
  return USA_DEMO_PARENTS.map((parent, index) => ({
    id: index + 100,
    label: parent.name,
    url: `/usa-shop/${parent.slug}`,
    description: parent.priceBand,
    children: parent.subs.map((sub, j) => ({
      id: (index + 100) * 1000 + j + 1,
      label: sub.name,
      url: `/usa-shop/${parent.slug}/${sub.slug}`,
      description: sub.priceBand,
    })),
  }));
}

export function getFrontendShopNavMenuEntry(): NavMenu[number] {
  return {
    id: 1,
    type: "MenuList",
    label: "Shop",
    url: "/usa-shop",
    children: getFrontendShopMenuListChildren() as unknown as NavMenu[number]["children"],
  };
}
