import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import "@/styles/globals.css";
import { satoshi, playfairDisplay } from "@/styles/fonts";
import TopBanner from "@/components/layout/Banner/TopBanner";
import TopNavbar from "@/components/layout/Navbar/TopNavbar";
import Footer from "@/components/layout/Footer";
import Providers from "./providers";

const HolyLoader = dynamic(() => import("holy-loader"), { ssr: false });
const PWAProvider = dynamic(() => import("@/components/PWAProvider"), { ssr: false });

export const metadata: Metadata = {
  title: "SRX Retail",
  description: "Discover and shop at SRX — your retailer storefront",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SRX Retail",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${satoshi.className} ${playfairDisplay.variable}`}>
        <HolyLoader color="#868686" />
        <TopBanner />
        <Providers>
          <TopNavbar />
          {children}
        </Providers>
        <Footer />
        <PWAProvider />
      </body>
    </html>
  );
}
