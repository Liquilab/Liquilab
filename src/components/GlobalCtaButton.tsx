import React from "react";
import Link from "next/link";

type Props = {
  href?: string;
  children?: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  disabled?: boolean;
};

export function GlobalCtaButton({
  href = "/pricing",
  children = "Start 14-day Pro trial",
  className = "",
  target,
  rel,
  disabled,
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold " +
    "bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors " +
    className;

  const isDisabled = disabled || !href || typeof href !== "string" || href.trim().length === 0;

  if (isDisabled) {
    return (
      <button type="button" className={base + " opacity-60 cursor-not-allowed"} disabled>
        {children}
      </button>
    );
  }

  const isExternal = href.startsWith("http://") || href.startsWith("https://");

  if (isExternal) {
    return (
      <a href={href} target={target} rel={rel} className={base}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} target={target} rel={rel} className={base}>
      {children}
    </Link>
  );
}

export default GlobalCtaButton;
