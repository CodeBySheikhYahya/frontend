import Link from "next/link";
import Image from "next/image";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { LLC_NAME } from "@/lib/contact-constants";
import {
  HeartHandshake,
  Leaf,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";

export const metadata = {
  title: "About Us | SRX Retail",
  description:
    "SRX Retail is a U.S.-focused fashion storefront built for clarity, quality, and a calm shopping experience.",
};

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2400&q=85";

const SECOND_IMAGE =
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=85";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8] text-black">
      {/* Hero */}
      <section className="relative isolate min-h-[58vh] overflow-hidden bg-neutral-950 md:min-h-[62vh]">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          className="object-cover opacity-45"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-60" />

        <div className="relative z-10 flex min-h-[58vh] flex-col justify-end md:min-h-[62vh]">
          <div className="max-w-frame mx-auto w-full px-4 pb-14 pt-28 md:pb-20 md:pt-32 xl:px-0">
            <Breadcrumb className="mb-8 text-white/70 [&_a]:text-white/80 [&_a:hover]:text-white">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/40" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium text-white">About</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
              SRX Retail
            </p>
            <h1
              className={cn(
                integralCF.className,
                "max-w-4xl text-[2.35rem] font-bold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl md:leading-[1.05]"
              )}
            >
              Fashion, framed for real life
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/78 sm:text-lg">
              We curate apparel and accessories with a U.S. lens—clear pricing, honest product
              pages, and checkout that does not get in your way.
            </p>
          </div>
        </div>
      </section>

      {/* Overlap intro */}
      <div className="relative z-20 -mt-12 px-4 pb-6 md:-mt-16 md:pb-10">
        <div className="max-w-frame mx-auto xl:px-0">
          <div className="rounded-3xl border border-black/[0.06] bg-white p-8 shadow-[0_32px_80px_-32px_rgba(0,0,0,0.18)] md:p-12 lg:p-14">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-14 lg:items-center">
              <div className="lg:col-span-7">
                <h2
                  className={cn(
                    integralCF.className,
                    "text-2xl font-bold tracking-tight text-black sm:text-3xl md:text-4xl"
                  )}
                >
                  Who we are
                </h2>
                <p className="mt-5 text-base leading-relaxed text-black/60 sm:text-lg">
                  SRX Retail is the storefront for people who want good pieces without the noise. We
                  focus on readable layouts, consistent sizing cues, and imagery that shows
                  products the way you would want to see them in a fitting room—not buried in
                  clutter or endless promos.
                </p>
                <p className="mt-4 text-base leading-relaxed text-black/60 sm:text-lg">
                  Behind the site is{" "}
                  <span className="font-semibold text-black">{LLC_NAME}</span>, operating with
                  straightforward policies and support you can actually reach.
                </p>
              </div>
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#ECEAE8] ring-1 ring-black/[0.04]">
                  <Image
                    src={SECOND_IMAGE}
                    alt="Studio styling and apparel"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 480px, 100vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <section className="px-4 py-14 md:py-20 xl:px-0">
        <div className="max-w-frame mx-auto">
          <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/40">
              What guides us
            </p>
            <h2
              className={cn(
                integralCF.className,
                "mt-2 text-3xl font-bold tracking-tight text-black md:text-4xl"
              )}
            >
              Principles you can feel in every screen
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "Clarity first",
                body: "Prices in USD, honest sale badges, and product pages that answer the basics before you add to cart.",
              },
              {
                icon: ShieldCheck,
                title: "Trust by design",
                body: "Clear policies, visible contact options, and bank-friendly checkout when you choose pay-by-transfer.",
              },
              {
                icon: Truck,
                title: "Built for the U.S.",
                body: "Shipping and language tuned for domestic shoppers—fewer surprises at checkout and delivery.",
              },
              {
                icon: HeartHandshake,
                title: "Human support",
                body: "Real inbox, real address on file, and room for receipts and references so we can match your payment.",
              },
              {
                icon: Leaf,
                title: "Less waste, more wear",
                body: "We favor timeless cuts and versatile layers over one-off trends that age out in a week.",
              },
              {
                icon: Users,
                title: "Community-minded",
                body: "We grow with feedback—from fit notes to what you want next in the USA Shop collections.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group flex flex-col rounded-2xl border border-black/[0.06] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-black/10 hover:shadow-[0_20px_50px_-28px_rgba(0,0,0,0.12)]"
              >
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0EEED] text-black/75 transition group-hover:bg-black group-hover:text-white">
                  <item.icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                </span>
                <h3 className="text-lg font-bold text-black">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-black/55">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento */}
      <section className="border-y border-black/[0.06] bg-white py-14 md:py-20">
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <div className="grid gap-4 md:grid-cols-2 md:grid-rows-2 lg:gap-5">
            <div className="flex min-h-[220px] flex-col justify-between rounded-3xl bg-neutral-950 p-8 text-white md:row-span-2 md:min-h-[420px] lg:p-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                  Our rhythm
                </p>
                <h3
                  className={cn(
                    integralCF.className,
                    "mt-4 text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl"
                  )}
                >
                  Edit often.
                  <br />
                  Ship carefully.
                </h3>
              </div>
              <p className="mt-8 max-w-sm text-sm leading-relaxed text-white/65 lg:text-base">
                New arrivals and sale edits land on a steady cadence. Every outbound package is
                checked for the right SKU, size, and tag—because returns cost everyone time.
              </p>
            </div>

            <div className="rounded-3xl border border-black/[0.06] bg-[#F7F5F3] p-8 lg:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
                USA Shop
              </p>
              <h3 className={cn(integralCF.className, "mt-3 text-xl font-bold sm:text-2xl")}>
                Demo collections, real structure
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-black/55 lg:text-base">
                Explore West Coast Living, American Heritage, and Sunbelt & Resort as curated
                stories—each with subcategories and PDPs that show multiple angles, the way a
                premium site should.
              </p>
              <Button
                asChild
                className="mt-6 h-11 rounded-full bg-black px-6 text-white hover:bg-black/90"
              >
                <Link href="/usa-shop">Browse USA Shop</Link>
              </Button>
            </div>

            <div className="rounded-3xl border border-black/[0.06] bg-gradient-to-br from-[#F4F2F0] to-white p-8 lg:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
                For partners
              </p>
              <h3 className={cn(integralCF.className, "mt-3 text-xl font-bold sm:text-2xl")}>
                Wholesale & press
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-black/55 lg:text-base">
                Introduce your line or request a line sheet—we read every note. Use the contact
                form and mention wholesale or press in the subject line.
              </p>
              <Button
                asChild
                variant="outline"
                className="mt-6 h-11 rounded-full border-black/20 bg-white"
              >
                <Link href="/contact">Get in touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-4 py-16 md:py-24 xl:px-0">
        <div className="max-w-frame mx-auto text-center">
          <h2
            className={cn(
              integralCF.className,
              "mx-auto max-w-3xl text-3xl font-bold tracking-tight text-black sm:text-4xl md:text-[2.75rem] md:leading-tight"
            )}
          >
            Ready to find your next favorite piece?
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base text-black/55 sm:text-lg">
            Start on the homepage, filter the main shop, or jump straight into our USA demo
            catalog—your cart stays consistent across the site.
          </p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              className="h-12 rounded-full bg-black px-10 text-base text-white hover:bg-black/90"
            >
              <Link href="/shop">Shop all</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-full border-black/20 bg-white px-10 text-base"
            >
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
