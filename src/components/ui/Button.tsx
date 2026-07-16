import Link from "next/link";
import { type ComponentProps } from "react";

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary: "bg-ink text-white hover:bg-ink/90 px-4 py-2.5",
  accent: "bg-accent text-white hover:bg-accent/90 px-4 py-2.5",
  ghost:
    "border border-line text-ink-2 hover:bg-canvas px-4 py-2.5",
  text: "text-accent-ink hover:underline p-0",
};

type Variant = keyof typeof variants;

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  block?: boolean;
};

export function Button({
  variant = "primary",
  block,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${block ? "w-full" : ""} ${className}`}
      {...props}
    />
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  block?: boolean;
};

export function ButtonLink({
  variant = "primary",
  block,
  className = "",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={`${base} ${variants[variant]} ${block ? "w-full" : ""} ${className}`}
      {...props}
    />
  );
}
