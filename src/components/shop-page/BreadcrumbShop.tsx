import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

type BreadcrumbShopProps = {
  /** e.g. "New Arrivals", "On Sale" — shown as Home › Shop › … */
  segment?: string;
};

const BreadcrumbShop = ({ segment }: BreadcrumbShopProps) => {
  return (
    <Breadcrumb className="mb-5 sm:mb-9">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/shop">Shop</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segment ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{segment}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbShop;
