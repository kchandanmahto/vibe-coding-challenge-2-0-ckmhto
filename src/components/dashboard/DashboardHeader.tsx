"use client";

import Link from "next/link";
import { Icon } from "./Icon";
import type { DashboardRole } from "./DashboardNavigation";

const roleUsers: Record<DashboardRole, { name: string; initials: string }> = {
  "head-coach": { name: "Raj Kumar", initials: "RK" },
  coach: { name: "Raj Kumar", initials: "RK" },
  player: { name: "Arjun Patel", initials: "AP" },
  scout: { name: "Neha Sharma", initials: "NS" },
};

const notifications = [
  { title: "Attendance submitted", detail: "Football squad · 12 minutes ago", unread: true },
  { title: "Match report ready", detail: "District league · 1 hour ago", unread: true },
  { title: "New player assigned", detail: "Academy roster · Yesterday", unread: false },
];

export function DashboardBreadcrumbs({ role }: { role: DashboardRole }) {
  const roleLabel = role === "head-coach" ? "Head Coach" : role[0].toUpperCase() + role.slice(1);
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
      <Link href="/" className="hover:text-blue-600">Academy</Link>
      <Icon name="chevron" className="h-3 w-3" />
      <span className="font-medium text-slate-700">{roleLabel}</span>
    </nav>
  );
}

export function UserProfileDropdown({ role }: { role: DashboardRole }) {
  const user = roleUsers[role];
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">{user.initials}</span>
        <span className="hidden text-left md:block">
          <span className="block text-sm font-semibold text-slate-800">{user.name}</span>
          <span className="block text-xs capitalize text-slate-500">{role.replace("-", " ")}</span>
        </span>
        <Icon name="chevron" className="hidden h-4 w-4 rotate-90 text-slate-400 md:block" />
      </summary>
      <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
        <p className="px-3 py-2 text-xs text-slate-500">Mock profile</p>
        <Link href={`/${role}`} className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">View profile</Link>
        <Link href="/" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Academy Desk home</Link>
      </div>
    </details>
  );
}

export function NotificationDropdown() {
  return (
    <details className="relative">
      <summary className="relative grid h-10 w-10 cursor-pointer list-none place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
        <Icon name="bell" className="h-[19px] w-[19px]" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-blue-600" />
        <span className="sr-only">Notifications</span>
      </summary>
      <div className="absolute right-0 mt-2 w-[min(340px,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-100 px-4 py-3"><p className="font-semibold text-slate-900">Notifications</p></div>
        <div className="divide-y divide-slate-100">
          {notifications.map((notification) => (
            <div key={notification.title} className="flex gap-3 px-4 py-3">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.unread ? "bg-blue-600" : "bg-slate-300"}`} />
              <div><p className="text-sm font-medium text-slate-800">{notification.title}</p><p className="mt-1 text-xs text-slate-500">{notification.detail}</p></div>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}
