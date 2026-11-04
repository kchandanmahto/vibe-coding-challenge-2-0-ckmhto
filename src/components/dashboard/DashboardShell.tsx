"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "./Icon";
import { DashboardBreadcrumbs, NotificationDropdown, UserProfileDropdown } from "./DashboardHeader";
import { DashboardSidebar, type DashboardRole } from "./DashboardNavigation";

export function DashboardShell({
  role,
  title,
  subtitle,
  children,
}: {
  role: DashboardRole;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <DashboardSidebar
        role={role}
        mobileOpen={open}
        onNavigate={() => setOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((current) => !current)}
      />

      {open && <button aria-label="Close menu" className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={() => setOpen(false)} />}

      <div className={`transition-[padding] duration-300 ${collapsed ? "lg:pl-[88px]" : "lg:pl-[248px]"}`}>
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button aria-label="Open menu" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-200 lg:hidden" onClick={() => setOpen(true)}>
              <Icon name="menu" />
            </button>
            <div className="min-w-0">
              <DashboardBreadcrumbs role={role} />
              <h1 className="mt-1 truncate text-base font-semibold text-slate-900 sm:text-xl">{title}</h1>
              <p className="hidden truncate text-xs text-slate-500 sm:block">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationDropdown />
            <div className="hidden h-10 w-px bg-slate-200 sm:block" />
            <UserProfileDropdown role={role} />
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
