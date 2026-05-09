import React from "react";
import { FooterLinks } from "./footer.types";
import Link from "next/link";
import { cn } from "@/lib/utils";

const footerLinksData: FooterLinks[] = [
  {
    id: 1,
    title: "company",
    children: [
      {
        id: 11,
        label: "about",
        url: "/about",
      },
      {
        id: 12,
        label: "features",
        url: "#",
      },
      {
        id: 13,
        label: "works",
        url: "#",
      },
      {
        id: 14,
        label: "career",
        url: "#",
      },
    ],
  },
  {
    id: 2,
    title: "help",
    children: [
      {
        id: 21,
        label: "customer support",
        url: "/faq",
      },
      {
        id: 25,
        label: "contact us",
        url: "/contact",
      },
      {
        id: 22,
        label: "delivery details",
        url: "/faq#deliveries",
      },
      {
        id: 23,
        label: "terms & conditions",
        url: "/terms",
      },
      {
        id: 24,
        label: "privacy policy",
        url: "/privacy",
      },
    ],
  },
  {
    id: 3,
    title: "faq",
    children: [
      {
        id: 31,
        label: "FAQs",
        url: "/faq",
      },
      {
        id: 32,
        label: "manage deliveries",
        url: "/faq#deliveries",
      },
      {
        id: 33,
        label: "orders",
        url: "/faq#orders",
      },
      {
        id: 34,
        label: "payments",
        url: "/faq#payments",
      },
      {
        id: 35,
        label: "account",
        url: "/faq#account",
      },
    ],
  },
  {
    id: 4,
    title: "resources",
    children: [
      {
        id: 41,
        label: "Free eBooks",
        url: "#",
      },
      {
        id: 42,
        label: "development tutorial",
        url: "#",
      },
      {
        id: 43,
        label: "How to - Blog",
        url: "#",
      },
      {
        id: 44,
        label: "youtube playlist",
        url: "#",
      },
    ],
  },
];

const LinksSection = () => {
  return (
    <>
      {footerLinksData.map((item) => (
        <section className="flex flex-col mt-5" key={item.id}>
          <h3 className="font-medium text-sm md:text-base uppercase tracking-widest mb-6">
            {item.title}
          </h3>
          {item.children.map((link) => (
            <Link
              href={link.url}
              key={link.id}
              className={cn([
                link.id !== 41 && link.id !== 43 && "capitalize",
                "text-black/60 text-sm md:text-base mb-4 w-fit",
              ])}
            >
              {link.label}
            </Link>
          ))}
        </section>
      ))}
    </>
  );
};

export default LinksSection;
