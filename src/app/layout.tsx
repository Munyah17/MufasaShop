import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavbarWrapper } from "@/components/layout/NavbarWrapper";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MUFASA Gadgets & Accessories | Premium Tech",
    template: "%s | MUFASA Gadgets",
  },
  description:
    "Discover premium tech accessories and gadgets. Elevate your digital lifestyle with MUFASA — where technology meets luxury.",
  keywords: ["tech accessories", "premium gadgets", "Zimbabwe", "MUFASA"],
  openGraph: {
    title: "MUFASA Gadgets & Accessories",
    description: "Premium tech accessories and gadgets.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-obsidian-900 text-obsidian-50 antialiased">
        <Providers>
          <NavbarWrapper />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
