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
  title: "Privacy Policy | SRX Retail",
  description: "How SRX Retail collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
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
              <BreadcrumbPage>Privacy Policy</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1
          className={cn([
            integralCF.className,
            "text-3xl md:text-[40px] font-bold mb-2",
          ])}
        >
          Privacy Policy
        </h1>
        <p className="text-sm text-black/50 mb-10">Last updated: May 9, 2026</p>

        <article className="max-w-3xl space-y-8 text-black/80 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-black mb-2">1. Who we are</h2>
            <p>
              This policy describes how SRX Retail (“we”, “us”) handles personal information
              when you visit our website or make a purchase. It is intended as a clear summary
              for customers; your legal rights depend on where you live.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-black mb-2">2. Information we collect</h2>
            <p>
              We may collect contact details (name, email, phone), shipping and billing
              addresses, order history, payment-related metadata from our payment partners
              (not full card numbers on our servers), and technical data such as device type,
              browser, and approximate location from standard server logs.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-black mb-2">3. How we use information</h2>
            <p>
              We use this information to process and deliver orders, communicate about your
              purchases, prevent fraud, improve the Site, and comply with law. With your
              consent where required, we may send marketing emails; you can unsubscribe using
              the link in any marketing message.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-black mb-2">4. Sharing</h2>
            <p>
              We share data with service providers who help us run the store (for example
              hosting, email delivery, payment processing, and shipping carriers) under
              contracts that limit their use of your data. We may disclose information if
              required by law or to protect rights and safety.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-black mb-2">5. Cookies & analytics</h2>
            <p>
              We may use cookies and similar technologies to remember preferences, keep you
              signed in where applicable, and measure Site performance. You can control
              cookies through your browser settings; blocking some cookies may limit features.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-black mb-2">6. Retention & security</h2>
            <p>
              We keep personal data only as long as needed for the purposes above and as
              required by law. We use reasonable technical and organizational measures to
              protect information, but no method of transmission over the Internet is 100%
              secure.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-black mb-2">7. Your choices</h2>
            <p>
              Depending on your location, you may have rights to access, correct, delete, or
              export your personal data, or to object to certain processing. Contact us to
              exercise those rights; we may need to verify your identity before responding.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-black mb-2">8. Children</h2>
            <p>
              The Site is not directed at children under 13, and we do not knowingly collect
              their personal information.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-black mb-2">9. Updates</h2>
            <p>
              We may update this policy from time to time. Material changes will be reflected
              by updating the date above and, where appropriate, a notice on the Site.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
