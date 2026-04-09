import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import * as motion from "framer-motion/client";

const categories = [
  {
    name: "Manto Kurtas",
    info: "wearing size S",
    image:
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&h=900&fit=crop&q=80",
    href: "/shop#kurtas",
  },
  {
    name: "Printed Co-Ords",
    info: "wearing size S",
    image:
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&h=900&fit=crop&q=80",
    href: "/shop#co-ords",
  },
  {
    name: "Scarves, Stoles & Odhnis",
    info: "wearing size S",
    image:
      "https://images.unsplash.com/photo-1601926444652-bbc98f46845d?w=600&h=900&fit=crop&q=80",
    href: "/shop#scarves",
  },
  {
    name: "Outerwear",
    info: "Model is 5'5\" tall",
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=900&fit=crop&q=80",
    href: "/shop#outerwear",
  },
];

const TrendingCategories = () => {
  return (
    <section className="bg-[#F0F0F0] py-[48px] md:py-[60px]">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <motion.h2
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-playfairDisplay text-[28px] md:text-[36px] leading-[1.15] text-[#1A1A1A] font-normal mb-2"
        >
          Explore Trending Categories
        </motion.h2>

        <motion.p
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="text-[13px] md:text-[14px] text-[#3D3D3D] mb-6 md:mb-8"
        >
          Explore Manto&apos;s Most Loved Pieces!
        </motion.p>

        <motion.div
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        >
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative overflow-hidden rounded-[12px] h-[220px] xs:h-[260px] md:h-[440px]"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-3 md:p-4 lg:p-5">
                <div className="min-w-0 flex-1 mr-2">
                  <p className="text-white/60 text-[9px] md:text-[10px] italic leading-tight mb-0.5">
                    {category.info}
                  </p>
                  <h3 className="font-playfairDisplay text-white text-[13px] xs:text-[14px] md:text-[18px] font-medium leading-tight">
                    {category.name}
                  </h3>
                </div>
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-white flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrendingCategories;
