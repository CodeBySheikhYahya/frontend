import { cn } from "@/lib/utils";
import { satoshi } from "@/styles/fonts";

type BrandLogoProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: { main: "text-sm" },
  md: { main: "text-base lg:text-lg" },
  lg: { main: "text-lg lg:text-xl" },
};

const BrandLogo = ({ size = "md", className }: BrandLogoProps) => {
  const s = sizeMap[size];

  return (
    <span className={cn("inline-flex leading-none", className)}>
      <span className={cn(satoshi.className, s.main, "font-medium leading-tight")}>
        Merchant Provider SRX LLC
      </span>
    </span>
  );
};

export default BrandLogo;
