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

export function NavItem({ href, icon: Icon, label, badge, disabled }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  if (disabled) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-[var(--radius-button)]",
          "text-text-muted cursor-not-allowed opacity-60"
        )}
      >
        <Icon className="w-5 h-5" />
        <span className="text-sm font-medium">{label}</span>
        {badge && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-bg-input text-text-muted border border-border">
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
        "flex items-center gap-3 px-4 py-3 rounded-[var(--radius-button)] transition-colors",
        isActive
          ? "bg-accent-yellow text-bg-primary"
          : "text-text-muted hover:bg-bg-input hover:text-text-primary"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
      {badge && (
        <span
          className={cn(
            "ml-auto text-xs px-2 py-0.5 rounded-full",
            isActive
              ? "bg-bg-primary/20 text-bg-primary"
              : "bg-bg-input text-text-muted border border-border"
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
