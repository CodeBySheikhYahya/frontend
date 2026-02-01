import * as React from "react";
import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/utils";
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { MenuListData } from "../navbar.types";

export type MenuListProps = {
  data: MenuListData;
  label: string;
};

export function MenuList({ data, label }: MenuListProps) {
  const [hoveredItemId, setHoveredItemId] = useState<number | null>(null);

  // Find the item that's being hovered to show its children
  const hoveredItem = data.find(item => item.id === hoveredItemId);
  const hoveredChildren = hoveredItem && (hoveredItem as any).children ? (hoveredItem as any).children : [];

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="font-normal px-3">
        {label}
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <div
          className="grid w-[600px] grid-cols-2 gap-0 p-0"
          onMouseLeave={() => setHoveredItemId(null)}
        >
          {/* Left Column: Parent Categories */}
          <div className="bg-gray-50 border-r border-gray-200">
            <ul className="p-2">
              {data.map((item) => {
                const hasChildren = (item as any).children && Array.isArray((item as any).children) && (item as any).children.length > 0;
                const isHovered = hoveredItemId === item.id;
                
                return (
                  <li
                    key={item.id}
                    onMouseEnter={() => setHoveredItemId(item.id)}
                  >
                    <Link
                      href={item.url ?? "/"}
                      className={cn(
                        "block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors",
                        isHovered
                          ? "bg-white text-foreground"
                          : "hover:bg-white hover:text-foreground"
                      )}
                    >
                      <div className="text-sm font-medium leading-none">{item.label}</div>
                      {item.description && (
                        <p className="text-xs leading-snug text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right Column: Subcategories of Hovered Parent */}
          <div className="bg-white">
            {hoveredChildren.length > 0 ? (
              <div className="p-4">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3">
                  {(hoveredItem as any)?.label?.toUpperCase() || "SUBCATEGORIES"}
                </h3>
                <ul className="space-y-2">
                  {hoveredChildren.map((child: any) => (
                    <li key={child.id}>
                      <Link
                        href={child.url ?? "/"}
                        className="block select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">{child.label}</div>
                        {child.description && (
                          <p className="text-xs leading-snug text-muted-foreground mt-1 line-clamp-2">
                            {child.description}
                          </p>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-4">
                <p className="text-sm text-muted-foreground">
                  Hover over a category to see subcategories
                </p>
              </div>
            )}
          </div>
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<typeof Link>,
  React.ComponentPropsWithoutRef<typeof Link>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
