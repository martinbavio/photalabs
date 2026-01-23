"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils/cn";
import { LucideIcon } from "lucide-react";

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: string;
  disabled?: boolean;
}

export function NavItem({
  href,
  icon: Icon,
  label,
  badge,
  disabled,
}: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  if (disabled) {
    return (
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3.5 rounded-[var(--radius-button)]",
          "text-text-muted cursor-not-allowed opacity-50"
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5" strokeWidth={2} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        {badge && (
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-border text-text-muted">
            {badge}
          </span>
        )}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 rounded-[var(--radius-button)] transition-colors",
        isActive
          ? "bg-accent-yellow text-bg-primary font-semibold"
          : "text-text-muted hover:bg-bg-input hover:text-text-primary font-medium"
      )}
    >
      <Icon className="w-5 h-5" strokeWidth={2} />
      <span className="text-sm">{label}</span>
    </Link>
  );
}
