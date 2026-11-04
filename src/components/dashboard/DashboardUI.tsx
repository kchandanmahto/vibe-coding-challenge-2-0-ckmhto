import type { ReactNode } from "react";
import { Icon } from "./Icon";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function SearchAndFilter({
  query,
  onQueryChange,
  queryPlaceholder,
  filterValue,
  onFilterChange,
  filterLabel,
  filterOptions,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  queryPlaceholder: string;
  filterValue: string;
  onFilterChange: (value: string) => void;
  filterLabel: string;
  filterOptions: string[];
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
      <label className="relative flex-1">
        <span className="sr-only">{queryPlaceholder}</span>
        <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={queryPlaceholder}
          className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </label>
      <label>
        <span className="sr-only">{filterLabel}</span>
        <select
          aria-label={filterLabel}
          value={filterValue}
          onChange={(event) => onFilterChange(event.target.value)}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 sm:w-auto"
        >
          {filterOptions.map((option) => <option key={option}>{option}</option>)}
        </select>
      </label>
    </div>
  );
}

export function LoadingState({ message = "Loading dashboard data..." }: { message?: string }) {
  return (
    <div role="status" className="flex min-h-48 items-center justify-center rounded-xl border border-slate-200 bg-white">
      <div className="text-center">
        <span className="mx-auto block h-7 w-7 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600" />
        <p className="mt-3 text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center px-5 py-10 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-500"><Icon name="search" /></span>
      <p className="mt-3 font-semibold text-slate-800">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
