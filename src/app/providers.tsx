"use client";

import { ReactNode, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { useCartStore } from "@/lib/store/cartStore";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      {children}
    </ThemeProvider>
  );
}
