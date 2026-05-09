import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Terms & Conditions | SRX Retail",
  description: "Terms and conditions for using the SRX Retail website and purchasing products.",
};

export default function TermsPage() {
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
              <BreadcrumbPage>Terms & Conditions</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1
          className={cn([
            integralCF.className,
            "text-3xl md:text-[40px] font-bold mb-2",
          ])}
        >
          Terms & Conditions
        </h1>
        <p className="text-sm text-black/50 mb-10">Last updated: May 9, 2026</p>

        <article className="max-w-3xl space-y-8 text-black/80 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-black mb-2">1. Agreement</h2>
            <p>
              By accessing or using the SRX Retail website (“Site”) and placing an order,
              you agree to these Terms & Conditions. If you do not agree, please do not use
              the Site.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-black mb-2">2. Products & pricing</h2>
            <p>
              We strive to display accurate descriptions, images, and prices. Errors may
              occur; we reserve the right to correct pricing or product information and to
              cancel or refuse orders that were placed based on incorrect information. All
              prices are in U.S. dollars unless stated otherwise.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-black mb-2">3. Orders & acceptance</h2>
            <p>
              Your order is an offer to purchase. We may confirm or decline orders. A
              contract is formed when we send you an order confirmation or ship your items,
              as described in your checkout flow.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-black mb-2">4. Shipping & risk</h2>
            <p>
              Delivery dates are estimates. Title and risk of loss pass to you when the
              carrier picks up the goods, except where local law requires otherwise.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-black mb-2">5. Returns & refunds</h2>
            <p>
              Return eligibility, time windows, and refund methods will match the policy
              shown on the Site at the time of purchase. Items must be unused and in
              original packaging where applicable, unless the item is defective.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-black mb-2">6. Limitation of liability</h2>
            <p>
              To the fullest extent permitted by law, SRX Retail is not liable for indirect,
              incidental, or consequential damages arising from your use of the Site or
              products. Our total liability for any claim related to an order is limited to
              the amount you paid for that order.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-black mb-2">7. Changes</h2>
            <p>
              We may update these terms from time to time. The “Last updated” date at the top
              will change when we do. Continued use of the Site after changes constitutes
              acceptance of the revised terms.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-black mb-2">8. Contact</h2>
            <p>
              Questions about these terms? Use the contact information provided in your
              order confirmation or on the Site footer, if listed.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
