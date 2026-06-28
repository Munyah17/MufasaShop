"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Render a placeholder during SSR/hydration to prevent layout shift
  if (!mounted) {
    return <div className="w-9 h-9" aria-hidden />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-9 h-9 flex items-center justify-center rounded-lg text-obsidian-400 hover:text-gold-500 hover:bg-obsidian-800 transition-all duration-200"
    >
      {isDark ? (
        <Sun size={18} className="transition-transform duration-300 rotate-0" />
      ) : (
        <Moon size={18} className="transition-transform duration-300 rotate-0" />
      )}
    </button>
  );
}
