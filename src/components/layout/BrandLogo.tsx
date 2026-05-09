import { cn } from "@/lib/utils";
import { brandScript } from "@/styles/fonts";

type BrandLogoProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: { main: "text-2xl" },
  md: { main: "text-3xl lg:text-4xl" },
  lg: { main: "text-[32px] lg:text-[40px]" },
};

const BrandLogo = ({ size = "md", className }: BrandLogoProps) => {
  const s = sizeMap[size];

  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span className={cn(brandScript.className, s.main, "leading-[1.1]")}>
        SRX
      </span>
    </span>
  );
};

export default BrandLogo;
