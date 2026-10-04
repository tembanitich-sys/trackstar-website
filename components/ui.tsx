import Link from "next/link";
import type { ReactNode } from "react";

const base =
  "inline-flex min-h-12 items-center justify-center rounded-lg px-6 py-3 text-center font-heading text-sm font-bold tracking-wide transition-colors duration-150";

const variants = {
  primary: "bg-green-text text-white hover:bg-navy",
  secondary: "border-2 border-navy bg-white text-navy hover:bg-neutral-bg",
} as const;

export function Button({
  href,
  variant = "primary",
  children,
  className = "",
}: {
  href: string;
  variant?: keyof typeof variants;
  children: ReactNode;
  className?: string;
}) {
  const classes = `${base} ${variants[variant]} ${className}`;
  if (/^https?:/.test(href)) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

export function Section({
  id,
  tone = "white",
  children,
  labelledBy,
}: {
  id?: string;
  tone?: "white" | "light" | "navy";
  children: ReactNode;
  labelledBy?: string;
}) {
  const tones = {
    white: "bg-white",
    light: "bg-neutral-bg",
    navy: "bg-navy text-white on-navy",
  };
  return (
    <section id={id} aria-labelledby={labelledBy} className={`${tones[tone]} py-16 sm:py-24`}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

export function H2({ id, children, className = "" }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <h2 id={id} className={`text-3xl leading-tight sm:text-4xl ${className}`}>
      {children}
    </h2>
  );
}
