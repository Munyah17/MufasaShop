import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import { NavbarWrapper } from "@/components/layout/NavbarWrapper";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { Providers } from "./providers";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
      className={`${cinzel.variable} ${inter.variable} h-full`}
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
