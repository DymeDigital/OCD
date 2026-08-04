import Link from "next/link";
import type { ReactNode } from "react";

const base =
  "label inline-flex items-center justify-center gap-2 rounded-[4px] px-6 py-3.5 transition-colors";
const variants = {
  primary: `${base} bg-ink text-paper hover:bg-ink/90`,
  ghost: `${base} border border-ink text-ink hover:bg-ink hover:text-paper`,
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <Link href={href} className={`${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  onClick,
  disabled,
}: {
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}
