"use client";

import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import Link from "next/link";
import React, { useMemo } from "react";
import { NavMenu } from "../navbar.types";
import { MenuList } from "./MenuList";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { MenuItem } from "./MenuItem";
import Image from "next/image";
import ResTopNavbar from "./ResTopNavbar";
import CartBtn from "./CartBtn";
import SearchBar from "./SearchBar";
import BrandLogo from "@/components/layout/BrandLogo";
import { getFrontendShopNavMenuEntry } from "@/lib/shop-nav-frontend";

const staticMenuItems: NavMenu = [
  {
    id: 2,
    type: "MenuItem",
    label: "On Sale",
    url: "/shop?filter=on-sale",
    children: [],
  },
  {
    id: 3,
    type: "MenuItem",
    label: "New Arrivals",
    url: "/shop?filter=new-arrivals",
    children: [],
  },
];

const TopNavbar = () => {
  const menuData = useMemo<NavMenu>(
    () => [getFrontendShopNavMenuEntry(), ...staticMenuItems],
    []
  );

  return (
    <nav className="sticky top-0 bg-white z-20">
      <div className="flex relative max-w-frame mx-auto items-center justify-between md:justify-start py-5 md:py-6 px-4 xl:px-0">
        <div className="flex items-center">
          <div className="block md:hidden mr-4">
            <ResTopNavbar data={menuData} />
          </div>
          <Link href="/" className="mr-3 lg:mr-10">
            <BrandLogo size="md" />
          </Link>
        </div>
        <NavigationMenu className="hidden md:flex mr-2 lg:mr-7">
          <NavigationMenuList>
            {menuData.map((item) => (
              <React.Fragment key={item.id}>
                {item.type === "MenuItem" && (
                  <MenuItem label={item.label} url={item.url} />
                )}
                {item.type === "MenuList" && (
                  <MenuList
                    data={item.children as any}
                    label={item.label}
                    browseAllHref="/usa-shop"
                    browseAllLabel="All collections (USA Shop)"
                  />
                )}
              </React.Fragment>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <div className="hidden md:flex mr-3 lg:mr-10 w-full max-w-md">
          <SearchBar />
        </div>
        <div className="flex items-center">
          <Link href="/search" className="block md:hidden mr-[14px] p-1">
            <Image
              priority
              src="/icons/search-black.svg"
              height={100}
              width={100}
              alt="search"
              className="max-w-[22px] max-h-[22px]"
            />
          </Link>
          <CartBtn />
          <Link href="/#signin" className="p-1">
            <Image
              priority
              src="/icons/user.svg"
              height={100}
              width={100}
              alt="user"
              className="max-w-[22px] max-h-[22px]"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
