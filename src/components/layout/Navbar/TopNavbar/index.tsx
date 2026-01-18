"use client";

import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { NavMenu } from "../navbar.types";
import { MenuList } from "./MenuList";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { MenuItem } from "./MenuItem";
import Image from "next/image";
import InputGroup from "@/components/ui/input-group";
import ResTopNavbar from "./ResTopNavbar";
import CartBtn from "./CartBtn";
import { getCategoriesForNavigation } from "@/lib/supabase/navigation";

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
  {
    id: 4,
    type: "MenuItem",
    label: "Brands",
    url: "/shop#brands",
    children: [],
  },
];

const TopNavbar = () => {
  const [menuData, setMenuData] = useState<NavMenu>(staticMenuItems);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getCategoriesForNavigation();
        
        // Create "Shop" menu with parent categories as children
        // Each parent category will have its child categories nested
        const shopMenuChildren = categories.map((category, index) => {
          // If category has children, create nested structure
          if (category.children && category.children.length > 0) {
            return {
              id: index + 100,
              label: category.name,
              url: `/shop/${category.slug}`, // Parent category URL - shows all products from children
              description: category.children.map(child => child.name).join(", "), // Show child names as description
              children: category.children.map((child, childIndex) => ({
                id: (index + 100) * 1000 + childIndex,
                label: child.name,
                url: `/shop/${category.slug}/${child.slug}`, // Child category URL - shows only that child's products
                description: child.description || undefined,
              })),
            };
          } else {
            // No children, just a simple link
            return {
              id: index + 100,
              label: category.name,
              url: `/shop/${category.slug}`,
              description: category.description || undefined,
            };
          }
        });

        // Create "Shop" as a MenuList with parent categories
        const shopMenuItem: NavMenu = [{
          id: 1,
          type: "MenuList" as const,
          label: "Shop",
          url: "/shop", // Clicking "Shop" goes to main shop page
          children: shopMenuChildren as any,
        }];

        // Combine shop menu with static items
        setMenuData([...shopMenuItem, ...staticMenuItems]);
      } catch (error) {
        console.error("Error fetching categories for navigation:", error);
        // Fallback: create simple Shop menu item
        const shopMenuItem: NavMenu = [{
          id: 1,
          type: "MenuItem" as const,
          label: "Shop",
          url: "/shop",
          children: [],
        }];
        setMenuData([...shopMenuItem, ...staticMenuItems]);
      }
    };

    fetchCategories();
  }, []);
  return (
    <nav className="sticky top-0 bg-white z-20">
      <div className="flex relative max-w-frame mx-auto items-center justify-between md:justify-start py-5 md:py-6 px-4 xl:px-0">
        <div className="flex items-center">
          <div className="block md:hidden mr-4">
            <ResTopNavbar data={menuData} />
          </div>
          <Link
            href="/"
            className={cn([
              integralCF.className,
              "text-2xl lg:text-[32px] mb-2 mr-3 lg:mr-10",
            ])}
          >
            YAHYA CO
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
                  <MenuList data={item.children} label={item.label} />
                )}
              </React.Fragment>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <InputGroup className="hidden md:flex bg-[#F0F0F0] mr-3 lg:mr-10">
          <InputGroup.Text>
            <Image
              priority
              src="/icons/search.svg"
              height={20}
              width={20}
              alt="search"
              className="min-w-5 min-h-5"
            />
          </InputGroup.Text>
          <InputGroup.Input
            type="search"
            name="search"
            placeholder="Search for products..."
            className="bg-transparent placeholder:text-black/40"
          />
        </InputGroup>
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
