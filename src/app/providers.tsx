"use client";

import { ReactNode, useEffect } from "react";
import { useCartStore } from "@/lib/store/cartStore";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Rehydrate cart from localStorage after first client render.
    // skipHydration: true in cartStore prevents the SSR/client mismatch
    // that caused "This page couldn't load" crashes.
    useCartStore.persist.rehydrate();
  }, []);

  return <>{children}</>;
}
