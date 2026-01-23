"use client";

import { Compass, History, PlusCircle, Users } from "lucide-react";
import { Logo } from "./Logo";
import { NavItem } from "./NavItem";
import { UserProfile } from "./UserProfile";

export function Sidebar() {
  return (
    <aside className="w-[var(--sidebar-width)] h-screen bg-bg-panel flex flex-col justify-between py-7 px-5 shrink-0">
      {/* Top section */}
      <div className="flex flex-col gap-9">
        {/* Logo */}
        <Logo />

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5">
          <NavItem href="/create" icon={PlusCircle} label="Create" />
          <NavItem href="/history" icon={History} label="History" />
          <NavItem href="/characters" icon={Users} label="Characters" />
          <NavItem
            href="/explore"
            icon={Compass}
            label="Explore"
            badge="Soon"
            disabled
          />
        </nav>
      </div>

      {/* Bottom section - User profile */}
      <div>
        <UserProfile />
      </div>
    </aside>
  );
}
