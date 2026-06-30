"use client";

import { usePathname } from "next/navigation";

const PORTAL_PREFIXES = ["/admin", "/agent", "/delivery"];

interface ShopChromeProps {
  navbar: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Client component wrapper — hides shop navbar + footer on portal routes.
 * usePathname() is always correct: works on SSR, and updates on client navigation.
 * Server components (NavbarWrapper, Footer) are passed as props so they stay server-rendered.
 */
export function ShopChrome({ navbar, footer, children }: ShopChromeProps) {
  const pathname = usePathname();
  const isPortal = PORTAL_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <>
      {!isPortal && navbar}
      {children}
      {!isPortal && footer}
    </>
  );
}
