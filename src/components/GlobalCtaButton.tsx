import Link from "next/link";
import { cn } from "@/components/ui/utils";

interface GlobalCtaButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export function GlobalCtaButton({
  href = "/pricing",
  label = "Start 14-day Pro trial",
  className,
}: GlobalCtaButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB] font-brand font-medium shadow-lg shadow-blue-500/20 h-11 px-6 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]",
        className
      )}
    >
      {label}
    </Link>
  );
}

export default GlobalCtaButton;
