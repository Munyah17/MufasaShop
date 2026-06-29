import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { NavbarWrapper } from "@/components/layout/NavbarWrapper";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { Providers } from "./providers";

const PORTAL_PREFIXES = ["/admin", "/agent", "/delivery"];

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono-accent",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isPortal = PORTAL_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <Providers>
          <NavbarWrapper />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          {!isPortal && <Footer />}
        </Providers>
      </body>
    </html>
  );
}
