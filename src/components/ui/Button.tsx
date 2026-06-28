import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gold" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "gold",
      size = "md",
      loading = false,
      fullWidth = false,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-semibold tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian-900 rounded-md";

    const variants = {
      gold: "bg-gold-500 text-zinc-950 hover:bg-gold-400 active:scale-[0.98] shadow-md hover:shadow-gold-500/20 hover:shadow-lg",
      outline:
        "border border-gold-500 text-gold-500 hover:bg-gold-500/10 active:scale-[0.98]",
      ghost: "text-obsidian-300 hover:text-gold-500 hover:bg-obsidian-800",
      danger: "bg-red-600 text-white hover:bg-red-500 active:scale-[0.98]",
    };

    const sizes = {
      sm: "text-xs px-3 py-2 h-8",
      md: "text-sm px-5 py-2.5 h-10",
      lg: "text-base px-8 py-3.5 h-12",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          base,
          variants[variant],
          sizes[size],
          fullWidth ? "w-full" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
