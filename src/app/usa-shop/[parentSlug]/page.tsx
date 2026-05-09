import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
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
import ProductCard from "@/components/common/ProductCard";
import {
  getUsaDemoParent,
  getUsaDemoProductsForParent,
  usaDemoProductPath,
} from "@/lib/usa-demo-catalog";

interface PageProps {
  params: { parentSlug: string };
}

export default function UsaShopParentPage({ params }: PageProps) {
  const parent = getUsaDemoParent(params.parentSlug);
  if (!parent) notFound();

  const products = getUsaDemoProductsForParent(parent.slug);

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
              <BreadcrumbLink asChild>
                <Link href="/usa-shop">USA Shop</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{parent.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="relative h-56 md:h-72 rounded-[20px] overflow-hidden mb-10 border border-black/10">
          <Image
            src={parent.heroImage}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 to-black/20" />
          <div className="absolute bottom-0 left-0 p-6 md:p-10 max-w-xl">
            <p className="text-white/80 text-sm font-medium mb-2">{parent.priceBand}</p>
            <h1
              className={cn([
                integralCF.className,
                "text-white text-3xl md:text-5xl font-bold mb-3",
              ])}
            >
              {parent.name}
            </h1>
            <p className="text-white/90 text-sm md:text-base">{parent.tagline}</p>
          </div>
        </div>

        <h2 className={cn(integralCF.className, "text-2xl font-bold mb-4")}>
          Subcategories
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-14">
          {parent.subs.map((sub) => (
            <Link
              key={sub.slug}
              href={`/usa-shop/${parent.slug}/${sub.slug}`}
              className="rounded-2xl border border-black/10 p-5 hover:bg-[#F0F0F0] transition-colors"
            >
              <p className="text-xs uppercase tracking-wider text-black/50 mb-1">
                Typical spend
              </p>
              <p className="text-sm font-semibold text-black mb-2">{sub.priceBand}</p>
              <h3 className="font-bold text-lg mb-1">{sub.name}</h3>
              <p className="text-sm text-black/60">{sub.blurb}</p>
            </Link>
          ))}
        </div>

        <h2 className={cn(integralCF.className, "text-2xl font-bold mb-6")}>
          All products in this collection
        </h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-5">
          {products.map((p) => (
            <ProductCard key={String(p.id)} data={p} href={usaDemoProductPath(p)} />
          ))}
        </div>
      </div>
    </main>
  );
}
