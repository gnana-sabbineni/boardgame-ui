import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantStyles: Record<Variant, string> = {
  primary: "border-accent text-accent hover:bg-accent hover:text-bg",
  secondary: "border-white/15 text-text hover:border-white/30",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-lg border bg-transparent px-4 py-2.5 font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
}