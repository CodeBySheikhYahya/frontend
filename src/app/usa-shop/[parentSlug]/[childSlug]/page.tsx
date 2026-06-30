import Link from "next/link";
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
  getUsaDemoProductsForSub,
  getUsaDemoSub,
  usaDemoProductPath,
} from "@/lib/usa-demo-catalog";

interface PageProps {
  params: { parentSlug: string; childSlug: string };
}

export default function UsaShopSubPage({ params }: PageProps) {
  const parent = getUsaDemoParent(params.parentSlug);
  const sub = getUsaDemoSub(params.parentSlug, params.childSlug);
  if (!parent || !sub) notFound();

  const products = getUsaDemoProductsForSub(parent.slug, sub.slug);

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
                <Link href="/usa-shop">Shop</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/usa-shop/${parent.slug}`}>{parent.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{sub.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <p className="text-xs font-medium uppercase tracking-wider text-black/50 mb-2">
          Typical spend in this edit
        </p>
        <p className="text-sm font-semibold text-black mb-2">{sub.priceBand}</p>
        <h1 className={cn(integralCF.className, "text-3xl md:text-4xl font-bold mb-3")}>
          {sub.name}
        </h1>
        <p className="text-black/60 max-w-2xl mb-10">{sub.blurb}</p>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-5">
          {products.map((p) => (
            <ProductCard key={String(p.id)} data={p} href={usaDemoProductPath(p)} />
          ))}
        </div>
      </div>
    </main>
  );
}
