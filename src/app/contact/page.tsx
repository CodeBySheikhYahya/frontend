import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ContactForm } from "@/components/contact/ContactForm";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import {
  CONTACT_EMAIL,
  LLC_NAME,
  MAP_QUERY,
  STREET,
} from "@/lib/contact-constants";
import { Building2, Mail, MapPin } from "lucide-react";

export const metadata = {
  title: "Contact Us | SRX Retail",
  description:
    "Contact SRX Retail (Merchant Provider SRX LLC). Send a message, view our address, or find us on the map.",
};

export default function ContactPage() {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&t=m&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F4F2F0] via-white to-white pb-16 sm:pb-24">
      <div className="border-b border-black/[0.06] bg-white/80 backdrop-blur-sm">
        <div className="max-w-frame mx-auto px-4 pt-5 sm:pt-6 xl:px-0">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-black/60 hover:text-black">
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-black">Contact</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="pb-10 sm:pb-12">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
              SRX Retail
            </p>
            <h1
              className={cn([
                integralCF.className,
                "max-w-3xl text-[2rem] font-bold leading-tight tracking-tight text-black sm:text-4xl md:text-5xl",
              ])}
            >
              Let&apos;s talk
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-black/55 sm:text-lg">
              Questions about an order, a return, or anything else? Send us a note — we read
              every message and reply as soon as we can.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <div className="mt-8 grid gap-8 lg:mt-12 lg:grid-cols-12 lg:gap-10 lg:items-start">
          {/* Form — full width on mobile, primary column on desktop */}
          <section
            className="order-1 lg:order-none lg:col-span-7"
            aria-labelledby="contact-form-heading"
          >
            <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.12)] sm:p-8 md:p-10">
              <h2 id="contact-form-heading" className="sr-only">
                Contact form
              </h2>
              <div className="mb-8 flex flex-col gap-1 border-b border-black/[0.06] pb-8 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3
                    className={cn(
                      integralCF.className,
                      "text-xl font-bold text-black sm:text-2xl"
                    )}
                  >
                    Send a message
                  </h3>
                  <p className="mt-1 text-sm text-black/50">
                    Fields marked <span className="text-red-600">*</span> are required.
                  </p>
                </div>
              </div>
              <ContactForm />
            </div>
          </section>

          {/* Sidebar: business + map */}
          <aside className="order-2 flex flex-col gap-6 lg:col-span-5">
            <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.1)] sm:p-7">
              <h3
                className={cn(
                  integralCF.className,
                  "mb-6 text-lg font-bold text-black"
                )}
              >
                Business details
              </h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0EEED] text-black/70">
                    <Building2 className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-black/40">
                      LLC / merchant
                    </p>
                    <p className="mt-0.5 text-sm font-medium leading-snug text-black sm:text-base">
                      {LLC_NAME}
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0EEED] text-black/70">
                    <MapPin className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-black/40">
                      Address
                    </p>
                    <p className="mt-0.5 text-sm font-medium leading-snug text-black sm:text-base">
                      {STREET}
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0EEED] text-black/70">
                    <Mail className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-black/40">
                      Email
                    </p>
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="mt-0.5 inline-block text-sm font-medium text-black underline decoration-black/25 underline-offset-4 transition hover:decoration-black sm:text-base"
                    >
                      {CONTACT_EMAIL}
                    </a>
                  </div>
                </li>
              </ul>
            </div>

            <div className="overflow-hidden rounded-2xl border border-black/[0.08] bg-[#ECEAE8] shadow-[0_20px_50px_-28px_rgba(0,0,0,0.1)]">
              <div className="border-b border-black/[0.06] bg-white/90 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-black/45">
                  Location
                </p>
                <p className="mt-0.5 text-sm font-medium text-black">{STREET}</p>
              </div>
              <div className="relative aspect-[4/3] min-h-[220px] w-full sm:min-h-[260px] lg:aspect-[5/4] lg:min-h-[280px]">
                <iframe
                  title="Map: SRX LLC business location"
                  src={mapSrc}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <p className="bg-white/90 px-4 py-2 text-center text-[11px] text-black/40">
                Map data © Google
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
