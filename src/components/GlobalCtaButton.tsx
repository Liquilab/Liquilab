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
  href = "/waitlist",
  children = "Start free trial",
  className = "",
  target,
  rel,
  disabled,
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium " +
    "bg-[#E9DCC3] text-black hover:opacity-90 " +
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
