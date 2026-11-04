"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Compass,
  Gauge,
  Medal,
  Settings,
  ShieldCheck,
  Trophy,
  User,
  UserRoundCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

export type DashboardRole = "head-coach" | "coach" | "player" | "scout";

export const dashboardRoleLinks: Record<DashboardRole, { icon: LucideIcon; label: string; href: string }[]> = {
  "head-coach": [
    { icon: Gauge, label: "Overview", href: "/head-coach" },
    { icon: Users, label: "Players", href: "/head-coach/players" },
    { icon: UserRoundCheck, label: "Coaches", href: "/head-coach/coaches" },
    { icon: Trophy, label: "Sports", href: "/head-coach/sports" },
    { icon: CalendarDays, label: "Sessions", href: "/head-coach/sessions" },
    { icon: ClipboardCheck, label: "Attendance", href: "/head-coach/attendance" },
    { icon: Medal, label: "Matches", href: "/head-coach/matches" },
    { icon: Activity, label: "Performance", href: "/head-coach/performance" },
    { icon: ShieldCheck, label: "Readiness", href: "/head-coach/readiness" },
    { icon: BarChart3, label: "Reports", href: "/head-coach/reports" },
    { icon: Settings, label: "Settings", href: "/head-coach/settings" },
  ],
  coach: [
    { icon: Gauge, label: "Overview", href: "/coach" },
    { icon: Users, label: "My Players", href: "/coach/players" },
    { icon: CalendarDays, label: "Sessions", href: "/coach/sessions" },
    { icon: ClipboardCheck, label: "Attendance", href: "/coach/attendance" },
    { icon: Medal, label: "Matches", href: "/coach/matches" },
    { icon: BarChart3, label: "Scores", href: "/coach/scores" },
    { icon: Activity, label: "Performance", href: "/coach/performance" },
    { icon: Settings, label: "Settings", href: "/coach/settings" },
  ],
  player: [
    { icon: Gauge, label: "Overview", href: "/player" },
    { icon: User, label: "My Profile", href: "/player/profile" },
    { icon: ClipboardCheck, label: "Attendance", href: "/player/attendance" },
    { icon: Medal, label: "Matches", href: "/player/matches" },
    { icon: Activity, label: "Performance", href: "/player/performance" },
    { icon: ShieldCheck, label: "Readiness", href: "/player#readiness" },
    { icon: Settings, label: "Settings", href: "/player#settings" },
  ],
  scout: [
    { icon: Gauge, label: "Overview", href: "/scout" },
    { icon: UserRoundCheck, label: "Ready Players", href: "/scout/players" },
    { icon: Compass, label: "Player Discovery", href: "/scout#discovery" },
    { icon: Trophy, label: "Sports", href: "/scout/sports" },
    { icon: Settings, label: "Settings", href: "/scout/settings" },
  ],
};

export function DashboardSidebar({
  role,
  mobileOpen,
  onNavigate,
  collapsed,
  onToggleCollapse,
}: {
  role: DashboardRole;
  mobileOpen: boolean;
  onNavigate: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const pathname = usePathname();
  const route = `/${role}`;
  const widthClass = collapsed ? "lg:w-[88px]" : "lg:w-[248px]";

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col overflow-hidden bg-[#101828] px-3 py-5 text-white transition-[width,transform] duration-300 lg:translate-x-0 ${widthClass} ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <Link href="/" onClick={onNavigate} className="mb-6 flex min-h-11 items-center gap-3 px-2">
        <span className="sr-only">Academy Desk home</span>
        <BrandLogo size={40} variant="icon" priority />
        <span className={`min-w-[150px] whitespace-nowrap transition-opacity ${collapsed ? "lg:opacity-0 lg:pointer-events-none" : "opacity-100"}`}>
          <span className="block font-semibold">Academy Desk</span>
          <span className="text-xs text-slate-400">Sports management</span>
        </span>
      </Link>
      <nav aria-label={`${role.replace("-", " ")} navigation`} className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden">
        {dashboardRoleLinks[role].map(({ icon: ItemIcon, label, href }) => {
          const baseRoute = role === "head-coach" ? "/head-coach" : route;
          const active = href === baseRoute ? pathname === baseRoute : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={label}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              title={collapsed ? label : undefined}
              className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${active ? "bg-[#2563eb] text-white shadow-lg shadow-blue-950/20" : "text-slate-300 hover:bg-white/8 hover:text-white"}`}
            >
              <ItemIcon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
              <span className={`min-w-[150px] whitespace-nowrap transition-opacity ${collapsed ? "lg:opacity-0 lg:pointer-events-none" : "opacity-100"}`}>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className={`mt-3 min-h-14 rounded-xl border border-white/8 bg-white/[0.04] p-3 transition-opacity ${collapsed ? "lg:opacity-0 lg:pointer-events-none" : "opacity-100"}`}>
        <p className="whitespace-nowrap text-xs uppercase tracking-wider text-slate-400">Mock workspace</p>
        <p className="whitespace-nowrap text-sm font-medium">Academy Desk Demo</p>
      </div>
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        className="absolute right-[-14px] top-[86px] hidden h-7 w-7 place-items-center rounded-full border border-slate-700 bg-[#101828] text-slate-300 shadow-md transition hover:text-white lg:grid"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
      <button type="button" onClick={onNavigate} aria-label="Close navigation" className="absolute right-3 top-5 grid h-9 w-9 place-items-center rounded-lg text-slate-300 hover:bg-white/10 lg:hidden">
        <span aria-hidden="true">×</span>
      </button>
    </aside>
  );
}
