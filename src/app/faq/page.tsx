import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "FAQs | SRX Retail",
  description: "Frequently asked questions about orders, shipping, payments, and your SRX account.",
};

const faqBlocks = [
  {
    id: "account",
    title: "Account",
    items: [
      {
        q: "How do I create or access my account?",
        a: "You can browse and check out as a guest. If you sign in (when available), your order history and saved addresses will appear in your account area. SRX Retail may add full account features over time.",
      },
      {
        q: "I forgot my password — what should I do?",
        a: "Use the “Forgot password” link on the sign-in screen if your email is registered. If you checked out as a guest, look for your confirmation email using the address you used at checkout.",
      },
    ],
  },
  {
    id: "orders",
    title: "Orders",
    items: [
      {
        q: "How do I track my order?",
        a: "After you place an order, you will receive a confirmation with an order number. Use the Orders link in the site footer or your confirmation email to view status. Tracking details are added when your package ships.",
      },
      {
        q: "Can I change or cancel my order?",
        a: "Contact us as soon as possible. If the order has not yet shipped, we may be able to update the address or cancel. Once shipped, standard return policies apply where applicable.",
      },
    ],
  },
  {
    id: "deliveries",
    title: "Deliveries",
    items: [
      {
        q: "Where do you ship?",
        a: "SRX Retail focuses on customers in the United States. Shipping zones and rates are shown at checkout. Remote or extended areas may require additional time.",
      },
      {
        q: "How long does delivery take?",
        a: "Typical processing is 1–2 business days, plus carrier transit time (often 3–7 business days within the continental U.S.). You will receive an estimated range at checkout and updates by email.",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We support major options shown at checkout, such as card-style payments, digital wallets where enabled, and other methods listed on the payment page. All totals are processed in U.S. dollars.",
      },
      {
        q: "Is my payment information secure?",
        a: "Payments are handled through trusted providers using industry-standard encryption. SRX Retail does not store your full card number on our servers.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>FAQs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1
          className={cn([
            integralCF.className,
            "text-3xl md:text-[40px] font-bold mb-3",
          ])}
        >
          Frequently asked questions
        </h1>
        <p className="text-black/60 max-w-2xl mb-12">
          Quick answers about shopping with SRX Retail. For anything not listed here,
          reach us through the contact options in your order confirmation.
        </p>

        <div className="max-w-3xl space-y-14">
          {faqBlocks.map((block) => (
            <section key={block.id} id={block.id}>
              <h2 className="text-lg font-semibold mb-4 scroll-mt-24">{block.title}</h2>
              <Accordion type="single" collapsible className="w-full border-t border-black/10">
                {block.items.map((item, idx) => (
                  <AccordionItem
                    key={item.q}
                    value={`${block.id}-${idx}`}
                    className="border-b border-black/10"
                  >
                    <AccordionTrigger className="text-left text-sm md:text-base hover:no-underline py-4">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-black/70 text-sm md:text-base pb-4 leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
