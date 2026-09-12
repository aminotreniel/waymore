import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/format";
import { IconArrowRight } from "@/components/icons";

type Variant = "primary" | "dark" | "outline" | "ghost" | "subtle" | "danger" | "success" | "info";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-lime-400 text-ink-950 hover:bg-lime-300 active:bg-lime-500 shadow-[0_1px_2px_rgba(15,31,26,.10)]",
  dark: "bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950",
  outline:
    "bg-white text-ink-900 ring-1 ring-inset ring-line-strong hover:bg-paper hover:ring-ink-200",
  ghost: "bg-transparent text-ink-800 hover:bg-mint-50",
  subtle: "bg-mint-100 text-ink-800 hover:bg-lime-100",
  danger: "bg-danger text-white hover:brightness-110",
  success: "bg-success text-white hover:brightness-110",
  info: "bg-info text-white hover:brightness-110",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5 rounded-lg",
  md: "h-11 px-5 text-[14.5px] gap-2 rounded-xl",
  lg: "h-[52px] px-7 text-[16px] gap-2.5 rounded-full",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  withArrow?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

const base =
  "inline-flex items-center justify-center font-semibold font-display whitespace-nowrap transition-[background-color,box-shadow,transform] duration-150 disabled:opacity-45 disabled:pointer-events-none active:translate-y-px";

export function Button({
  variant = "primary",
  size = "md",
  withArrow,
  fullWidth,
  className,
  children,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cx(base, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
      {...rest}
    >
      {children}
      {withArrow && <IconArrowRight size={size === "lg" ? 19 : 16} />}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  withArrow,
  fullWidth,
  className,
  children,
}: CommonProps & { href: string }) {
  return (
    <Link
      href={href}
      className={cx(base, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
    >
      {children}
      {withArrow && <IconArrowRight size={size === "lg" ? 19 : 16} />}
    </Link>
  );
}
