import Link from "next/link";
import Image from "next/image";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { USA_DEMO_PARENTS } from "@/lib/usa-demo-catalog";

export const metadata = {
  title: "Shop | Merchant Provider SRX LLC",
  description:
    "Browse private-label collections — generic men's, women's, and accessory styles with no third-party branding.",
};

export default function UsaShopIndexPage() {
  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <Breadcrumb className="mb-5 sm:mb-9">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Shop</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1
          className={cn([
            integralCF.className,
            "text-3xl md:text-[40px] font-bold mb-3 capitalize",
          ])}
        >
          Shop
        </h1>
        <p className="text-black/60 max-w-2xl mb-10">
          Private-label apparel from Merchant Provider SRX LLC. Every product uses a
          generic title only — no Nike, Levi&apos;s, or other famous brand names.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {USA_DEMO_PARENTS.map((parent) => (
            <Link
              key={parent.slug}
              href={`/usa-shop/${parent.slug}`}
              className="group relative overflow-hidden rounded-[20px] border border-black/10 bg-white shadow-sm min-h-[280px]"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={parent.heroImage}
                  alt={parent.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>
              <div className="p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-black/50 mb-1">
                  Typical spend
                </p>
                <p className="text-sm font-semibold text-black mb-2">{parent.priceBand}</p>
                <h2 className={cn(integralCF.className, "text-xl font-bold mb-2")}>
                  {parent.name}
                </h2>
                <p className="text-sm text-black/60 line-clamp-2">{parent.tagline}</p>
                <span className="mt-4 inline-block text-sm font-medium text-black underline-offset-4 group-hover:underline">
                  View subcategories & products
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
