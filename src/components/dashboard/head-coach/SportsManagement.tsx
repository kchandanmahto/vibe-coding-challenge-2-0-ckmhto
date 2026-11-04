"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Eye, Pencil, Plus, RotateCcw, Search, ShieldAlert, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatCard, StatusBadge } from "../Dashboard";

type SportStatus = "Active" | "Inactive";
type Sport = {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  coaches: string[];
  players: number;
  sessions: number;
  matches: number;
  attendance: number;
  status: SportStatus;
};

const sportCategories = ["Team", "Individual", "Combat", "Outdoor", "Indoor"];
const initialSports: Sport[] = [
  { id: "SPR-1001", name: "Football", description: "Skills, fitness and competitive team development.", category: "Team", icon: "⚽", coaches: ["Raj Kumar", "Daniel Thomas"], players: 68, sessions: 42, matches: 16, attendance: 89, status: "Active" },
  { id: "SPR-1002", name: "Cricket", description: "Batting, bowling and fielding development.", category: "Team", icon: "🏏", coaches: ["Imran Ali", "Daniel Thomas"], players: 54, sessions: 38, matches: 12, attendance: 86, status: "Active" },
  { id: "SPR-1003", name: "Swimming", description: "Technique, endurance and water safety training.", category: "Individual", icon: "🏊", coaches: ["Neha Rao"], players: 32, sessions: 29, matches: 8, attendance: 91, status: "Active" },
  { id: "SPR-1004", name: "Athletics", description: "Track, field, speed and strength conditioning.", category: "Individual", icon: "🏃", coaches: ["Raj Kumar", "Neha Rao"], players: 41, sessions: 31, matches: 10, attendance: 84, status: "Active" },
  { id: "SPR-1005", name: "Basketball", description: "Team play, shooting and court skill development.", category: "Team", icon: "🏀", coaches: ["Aisha Khan"], players: 29, sessions: 18, matches: 7, attendance: 78, status: "Inactive" },
];
const pageSize = 5;

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div role="dialog" aria-modal="true" aria-labelledby="sport-modal-title" className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4"><h2 id="sport-modal-title" className="font-semibold text-slate-900">{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>{children}</div></div>;
}

function SportForm({ sport, onCancel, onSave }: { sport?: Sport; onCancel: () => void; onSave: (sport: Sport) => void }) {
  const [error, setError] = useState("");
  const [iconName, setIconName] = useState(sport?.icon ?? "");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    if (!name || !description) {
      setError("Sport name and description are required.");
      return;
    }
    onSave({
      id: sport?.id ?? `SPR-${Math.floor(1006 + Math.random() * 7000)}`,
      name,
      description,
      category: String(data.get("category")),
      icon: iconName || "🏅",
      coaches: sport?.coaches ?? [],
      players: sport?.players ?? 0,
      sessions: sport?.sessions ?? 0,
      matches: sport?.matches ?? 0,
      attendance: sport?.attendance ?? 0,
      status: String(data.get("status")) as SportStatus,
    });
  };
  const inputClass = "mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
  return <form onSubmit={submit} className="space-y-5 p-5">{error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    <div className="grid gap-4 sm:grid-cols-[120px_1fr]"><label className="text-sm font-medium text-slate-700">Sport icon<select value={iconName} onChange={(event) => setIconName(event.target.value)} className="mt-1.5 h-16 w-full rounded-xl border border-slate-200 text-center text-2xl"><option value="">🏅</option>{["⚽", "🏏", "🏊", "🏀", "🏃", "🏸", "🥊", "🎾"].map((icon) => <option key={icon} value={icon}>{icon}</option>)}</select></label><div><label className="text-sm font-medium text-slate-700">Sport name *<input name="name" defaultValue={sport?.name} required className={inputClass} /></label></div></div>
    <label className="block text-sm font-medium text-slate-700">Description *<textarea name="description" defaultValue={sport?.description} required rows={4} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
    <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700">Category<select name="category" defaultValue={sport?.category ?? "Team"} className={inputClass}>{sportCategories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="text-sm font-medium text-slate-700">Status<select name="status" defaultValue={sport?.status ?? "Active"} className={inputClass}><option>Active</option><option>Inactive</option></select></label></div>
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">The icon or image selector is a frontend preview. Coach assignments and player records remain managed in their respective modules.</div>
    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Cancel</button><button type="submit" className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700">{sport ? "Save changes" : "Add sport"}</button></div>
  </form>;
}

export function SportsManagement() {
  const [sports, setSports] = useState(initialSports);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [status, setStatus] = useState("All statuses");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<"add" | "edit" | "view" | null>(null);
  const [selected, setSelected] = useState(initialSports[0]);
  const [statusTarget, setStatusTarget] = useState<Sport | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => { const timer = window.setTimeout(() => setLoading(false), 350); return () => window.clearTimeout(timer); }, []);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return [...sports].filter((sport) => (!search || sport.name.toLowerCase().includes(search) || sport.id.toLowerCase().includes(search)) && (category === "All categories" || sport.category === category) && (status === "All statuses" || sport.status === status)).sort((a, b) => sort === "players" ? b.players - a.players : sort === "coaches" ? b.coaches.length - a.coaches.length : sort === "id" ? a.id.localeCompare(b.id) : a.name.localeCompare(b.name));
  }, [sports, query, category, status, sort]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const active = sports.filter((sport) => sport.status === "Active").length;
  const coachIds = new Set(sports.flatMap((sport) => sport.coaches));
  const players = sports.reduce((total, sport) => total + sport.players, 0);
  const reset = () => { setQuery(""); setCategory("All categories"); setStatus("All statuses"); setPage(1); };
  const saveSport = (sport: Sport) => { const exists = sports.some((item) => item.id === sport.id); setSports((current) => exists ? current.map((item) => item.id === sport.id ? sport : item) : [sport, ...current]); setModal(null); notify(exists ? "Sport changes previewed locally." : "Sport added to the local demonstration list."); };
  const changeStatus = () => {
    if (!statusTarget) return;
    const nextStatus = statusTarget.status === "Active" ? "Inactive" : "Active";
    setSports((current) => current.map((sport) => sport.id === statusTarget.id ? { ...sport, status: nextStatus } : sport));
    setStatusTarget(null);
    notify(`${statusTarget.name} is now ${nextStatus.toLowerCase()}.`);
  };

  return <DashboardShell role="head-coach" title="Sports Management" subtitle="Demonstration data · Manage academy sports">
    <PageHeader title="Sports Management" description="Demonstration data · Manage academy sports" action={<button onClick={() => setModal("add")} className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"><Plus className="h-4 w-4" />Add sport</button>} />
    <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total sports" value={String(sports.length)} detail="Academy demonstration records" icon="trophy" /><StatCard label="Active sports" value={String(active)} detail={`${sports.length - active} inactive sports`} icon="activity" tone="green" /><StatCard label="Assigned coaches" value={String(coachIds.size)} detail="Unique coach assignments" icon="users" tone="violet" /><StatCard label="Registered players" value={String(players)} detail="Across all demonstration sports" icon="users" tone="amber" /></div>
    {loading ? <LoadingState message="Loading sports..." /> : <Panel title={`Sports (${filtered.length})`}>
      <div className="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-[minmax(220px,1fr)_180px_180px_180px_44px]">
        <label className="relative"><span className="sr-only">Search sports</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search sport or ID..." className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500" /></label>
        <select aria-label="Filter by category" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All categories</option>{sportCategories.map((item) => <option key={item}>{item}</option>)}</select>
        <select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All statuses</option><option>Active</option><option>Inactive</option></select>
        <select aria-label="Sort sports" value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option value="name">Name A-Z</option><option value="players">Most players</option><option value="coaches">Most coaches</option><option value="id">Sport ID</option></select>
        <button onClick={reset} aria-label="Reset filters" className="grid h-10 place-items-center rounded-lg border border-slate-200 text-slate-500"><RotateCcw className="h-4 w-4" /></button>
      </div>
      {visible.length ? <>
        <div className="overflow-x-auto"><table className="w-full min-w-[930px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Sport</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Coaches</th><th className="px-5 py-3">Players</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((sport) => <tr key={sport.id} className="hover:bg-slate-50/60"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-xl">{sport.icon}</span><div><p className="font-semibold text-slate-900">{sport.name}</p><p className="text-xs text-slate-500">{sport.id}</p><p className="mt-1 max-w-xs truncate text-xs text-slate-500">{sport.description}</p></div></div></td><td className="px-5 py-4 text-slate-600">{sport.category}</td><td className="px-5 py-4"><span className="font-semibold text-slate-800">{sport.coaches.length}</span><p className="mt-1 max-w-40 truncate text-xs text-slate-500">{sport.coaches.join(", ")}</p></td><td className="px-5 py-4 font-semibold text-slate-800">{sport.players}</td><td className="px-5 py-4"><StatusBadge tone={sport.status === "Active" ? "green" : "slate"}>{sport.status}</StatusBadge></td><td className="px-5 py-4"><div className="flex gap-2"><button onClick={() => { setSelected(sport); setModal("view"); }} aria-label={`View ${sport.name}`} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600"><Eye className="h-4 w-4" /></button><button onClick={() => { setSelected(sport); setModal("edit"); }} aria-label={`Edit ${sport.name}`} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600"><Pencil className="h-4 w-4" /></button><button onClick={() => setStatusTarget(sport)} className="h-8 rounded-lg border border-slate-200 px-2 text-xs font-medium text-slate-600">{sport.status === "Active" ? "Deactivate" : "Activate"}</button></div></td></tr>)}</tbody></table></div>
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span><div className="flex items-center gap-2"><button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Previous page" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span>Page {page} of {pageCount}</span><button disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} aria-label="Next page" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>
      </> : <EmptyState title="No sports found" description="Change the search, category or status filters." action={<button onClick={reset} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Reset filters</button>} />}
    </Panel>}
    {(modal === "add" || modal === "edit") && <Modal title={modal === "add" ? "Add sport" : `Edit ${selected.name}`} onClose={() => setModal(null)}><SportForm sport={modal === "edit" ? selected : undefined} onCancel={() => setModal(null)} onSave={saveSport} /></Modal>}
    {modal === "view" && <Modal title="Sport overview" onClose={() => setModal(null)}><div className="p-5"><div className="flex items-center gap-4 rounded-xl bg-slate-50 p-5"><span className="grid h-16 w-16 place-items-center rounded-xl bg-white text-3xl shadow-sm">{selected.icon}</span><div><h3 className="text-lg font-bold text-slate-900">{selected.name}</h3><p className="text-sm text-slate-500">{selected.id} · {selected.category}</p></div><div className="ml-auto"><StatusBadge tone={selected.status === "Active" ? "green" : "slate"}>{selected.status}</StatusBadge></div></div><p className="mt-5 text-sm text-slate-600">{selected.description}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Registered players", selected.players], ["Assigned coaches", selected.coaches.length], ["Sessions", selected.sessions], ["Matches", selected.matches]].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>)}</div>
      <div className="mt-5 grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-slate-200 p-4"><p className="font-semibold text-slate-900">Assigned coaches</p><div className="mt-3 flex flex-wrap gap-2">{selected.coaches.length ? selected.coaches.map((coach) => <StatusBadge key={coach} tone="blue">{coach}</StatusBadge>) : <span className="text-sm text-slate-500">No coaches assigned</span>}</div></div><div className="rounded-xl border border-slate-200 p-4"><p className="font-semibold text-slate-900">Attendance summary</p><p className="mt-3 text-2xl font-bold text-slate-900">{selected.attendance}%</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${selected.attendance}%` }} /></div></div></div>
      <div className="mt-5 flex justify-end"><button onClick={() => setModal(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Close overview</button></div></div></Modal>}
    {statusTarget && <Modal title="Change sport status" onClose={() => setStatusTarget(null)}><div className="p-5"><div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><ShieldAlert className="h-5 w-5 shrink-0" /><p>{statusTarget.players > 0 ? `This sport has ${statusTarget.players} registered players and ${statusTarget.coaches.length} coach assignments. ` : ""}{statusTarget.status === "Active" ? "Deactivating" : "Activating"} this sport may affect future scheduling. Confirm the demonstration change?</p></div><div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button onClick={() => setStatusTarget(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Cancel</button><button onClick={changeStatus} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">Confirm change</button></div></div></Modal>}
    {toast && <div role="status" className="fixed bottom-5 right-5 z-[60] rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">{toast}</div>}
  </DashboardShell>;
}
