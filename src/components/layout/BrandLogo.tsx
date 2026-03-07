import { cn } from "@/lib/utils";
import { brandScript } from "@/styles/fonts";

type BrandLogoProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: {
    main: "text-2xl",
    sub: "text-[9px]",
  },
  md: {
    main: "text-3xl lg:text-4xl",
    sub: "text-[10px] lg:text-xs",
  },
  lg: {
    main: "text-[32px] lg:text-[40px]",
    sub: "text-xs lg:text-sm",
  },
};

const BrandLogo = ({ size = "md", className }: BrandLogoProps) => {
  const s = sizeMap[size];

  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span className={cn(brandScript.className, s.main, "leading-[1.1]")}>
        Hulmattire
      </span>
      <span className={cn(s.sub, "tracking-[0.2em] uppercase font-medium opacity-60 mt-0.5")}>
        by STM
      </span>
    </span>
  );
};

export default BrandLogo;
