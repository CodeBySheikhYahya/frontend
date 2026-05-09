import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Header from "@/components/product-page/Header";
import Tabs from "@/components/product-page/Tabs";
import ProductCard from "@/components/common/ProductCard";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import {
  getAllUsaDemoProducts,
  getUsaDemoProductById,
  usaDemoProductPath,
} from "@/lib/usa-demo-catalog";

interface PageProps {
  params: { id: string; titleSlug: string };
}

export default function UsaDemoProductPage({ params }: PageProps) {
  const product = getUsaDemoProductById(params.id);
  if (!product) notFound();

  const related = getAllUsaDemoProducts()
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <main>
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
              <BreadcrumbPage>{product.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <section className="mb-11">
          <Header data={product} />
        </section>
        <Tabs productId={String(product.id)} description={product.description} />
      </div>
      <div className="max-w-frame mx-auto px-4 xl:px-0 mb-[50px] sm:mb-20">
        <h2
          className={cn([
            integralCF.className,
            "text-center text-[32px] md:text-5xl mb-8 md:mb-14 capitalize",
          ])}
        >
          More from USA Shop
        </h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-5 justify-items-center">
          {related.map((p) => (
            <ProductCard key={String(p.id)} data={p} href={usaDemoProductPath(p)} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/usa-shop"
            className="inline-block sm:w-[218px] px-[54px] py-4 border rounded-full font-medium text-sm sm:text-base border-black/10 hover:bg-black hover:text-white transition-colors"
          >
            View all USA Shop
          </Link>
        </div>
      </div>
    </main>
  );
}
