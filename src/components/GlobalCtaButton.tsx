import Link from "next/link";
import React from "react";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
};

export default function GlobalCtaButton({ href, children, className = "", target, rel }: Props) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={[
        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium",
        "bg-[#E9DCC3] text-black hover:opacity-90",
        className,
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
