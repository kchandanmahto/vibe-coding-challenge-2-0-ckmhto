"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Camera, ChevronLeft, ChevronRight, Eye, Pencil, Plus, RotateCcw, Search, ShieldCheck, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatCard, StatusBadge } from "../Dashboard";

type CoachStatus = "Active" | "Inactive";
type Coach = {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: "Male" | "Female" | "Other";
  address: string;
  sports: string[];
  players: number;
  joined: string;
  status: CoachStatus;
};

const sports = ["Football", "Cricket", "Swimming", "Athletics", "Basketball"];
const initialCoaches: Coach[] = [
  { id: "CCH-1001", name: "Raj Kumar", email: "raj.kumar@academy.example", phone: "+91 98765 41001", gender: "Male", address: "Pune, Maharashtra", sports: ["Football", "Athletics"], players: 48, joined: "2021-07-14", status: "Active" },
  { id: "CCH-1002", name: "Neha Rao", email: "neha.rao@academy.example", phone: "+91 98765 41002", gender: "Female", address: "Pune, Maharashtra", sports: ["Swimming", "Athletics"], players: 31, joined: "2022-01-09", status: "Active" },
  { id: "CCH-1003", name: "Imran Ali", email: "imran.ali@academy.example", phone: "+91 98765 41003", gender: "Male", address: "Pune, Maharashtra", sports: ["Cricket"], players: 36, joined: "2020-11-22", status: "Active" },
  { id: "CCH-1004", name: "Aisha Khan", email: "aisha.khan@academy.example", phone: "+91 98765 41004", gender: "Female", address: "Pune, Maharashtra", sports: ["Basketball"], players: 19, joined: "2023-03-06", status: "Inactive" },
  { id: "CCH-1005", name: "Daniel Thomas", email: "daniel.thomas@academy.example", phone: "+91 98765 41005", gender: "Male", address: "Pune, Maharashtra", sports: ["Football", "Cricket"], players: 24, joined: "2023-08-18", status: "Active" },
];

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="coach-modal-title" className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <h2 id="coach-modal-title" className="font-semibold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CoachForm({ coach, onCancel, onSave }: { coach?: Coach; onCancel: () => void; onSave: (coach: Coach) => void }) {
  const [error, setError] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [assignedSports, setAssignedSports] = useState(coach?.sports ?? []);

  const toggleSport = (sport: string) => {
    setAssignedSports((current) => current.includes(sport) ? current.filter((item) => item !== sport) : [...current, sport]);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const address = String(data.get("address") ?? "").trim();
    if (!name || !email || !phone || !address) {
      setError("Please complete all required coach fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!assignedSports.length) {
      setError("Assign at least one sport.");
      return;
    }
    onSave({
      id: coach?.id ?? `CCH-${Math.floor(1006 + Math.random() * 7000)}`,
      name,
      email,
      phone,
      gender: String(data.get("gender")) as Coach["gender"],
      address,
      sports: assignedSports,
      players: coach?.players ?? 0,
      joined: coach?.joined ?? String(data.get("joined")),
      status: String(data.get("status")) as CoachStatus,
    });
  };

  const inputClass = "mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
  return (
    <form onSubmit={submit} className="space-y-5 p-5">
      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 sm:flex-row">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">{coach ? coach.name.split(" ").map((part) => part[0]).join("") : "C"}</span>
        <div className="flex-1 text-center sm:text-left"><p className="text-sm font-semibold text-slate-800">Profile photo</p><p className="mt-1 text-xs text-slate-500">{photoName || "Optional demonstration image selection"}</p></div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"><Camera className="h-4 w-4" />Choose photo<input type="file" accept="image/*" className="sr-only" onChange={(event) => setPhotoName(event.target.files?.[0]?.name ?? "")} /></label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">Full name *<input name="name" defaultValue={coach?.name} required className={inputClass} /></label>
        <label className="text-sm font-medium text-slate-700">Email *<input name="email" type="email" defaultValue={coach?.email} required className={inputClass} /></label>
        <label className="text-sm font-medium text-slate-700">Phone number *<input name="phone" type="tel" defaultValue={coach?.phone} required className={inputClass} /></label>
        <label className="text-sm font-medium text-slate-700">Gender<select name="gender" defaultValue={coach?.gender ?? "Male"} className={inputClass}><option>Male</option><option>Female</option><option>Other</option></select></label>
        <label className="text-sm font-medium text-slate-700">Joining date<input name="joined" type="date" defaultValue={coach?.joined ?? new Date().toISOString().slice(0, 10)} required className={inputClass} /></label>
        <label className="text-sm font-medium text-slate-700">Account status<select name="status" defaultValue={coach?.status ?? "Active"} className={inputClass}><option>Active</option><option>Inactive</option></select></label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">Address *<input name="address" defaultValue={coach?.address} required className={inputClass} /></label>
      </div>
      <fieldset><legend className="text-sm font-semibold text-slate-800">Assigned sports *</legend><div className="mt-3 flex flex-wrap gap-2">{sports.map((sport) => {
        const selected = assignedSports.includes(sport);
        return <label key={sport} className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${selected ? "border-blue-500 bg-blue-50 font-semibold text-blue-700" : "border-slate-200 text-slate-600"}`}><input type="checkbox" checked={selected} onChange={() => toggleSport(sport)} className="mr-2" />{sport}</label>;
      })}</div>{assignedSports.length > 0 && <p className="mt-2 text-xs text-slate-500">Assigned: {assignedSports.join(", ")}</p>}</fieldset>
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Cancel</button><button type="submit" className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700">{coach ? "Save changes" : "Add coach"}</button></div>
    </form>
  );
}

export function CoachesManagement() {
  const [coaches, setCoaches] = useState(initialCoaches);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [status, setStatus] = useState("All statuses");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<"add" | "edit" | "view" | null>(null);
  const [selected, setSelected] = useState(initialCoaches[0]);
  const [statusTarget, setStatusTarget] = useState<Coach | null>(null);
  const [toast, setToast] = useState("");
  const pageSize = 5;

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return [...coaches].filter((coach) =>
      (!search || coach.name.toLowerCase().includes(search) || coach.id.toLowerCase().includes(search)) &&
      (sport === "All sports" || coach.sports.includes(sport)) &&
      (status === "All statuses" || coach.status === status)
    ).sort((a, b) => {
      if (sort === "players") return b.players - a.players;
      if (sort === "joined") return b.joined.localeCompare(a.joined);
      if (sort === "id") return a.id.localeCompare(b.id);
      return a.name.localeCompare(b.name);
    });
  }, [coaches, query, sport, status, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const active = coaches.filter((coach) => coach.status === "Active").length;
  const assignedPlayers = coaches.reduce((total, coach) => total + coach.players, 0);
  const coveredSports = new Set(coaches.flatMap((coach) => coach.sports)).size;

  const saveCoach = (coach: Coach) => {
    const exists = coaches.some((item) => item.id === coach.id);
    setCoaches((current) => exists ? current.map((item) => item.id === coach.id ? coach : item) : [coach, ...current]);
    setModal(null);
    notify(exists ? "Coach changes previewed locally." : "Coach added to the local demonstration list.");
  };

  const changeStatus = () => {
    if (!statusTarget) return;
    const nextStatus = statusTarget.status === "Active" ? "Inactive" : "Active";
    setCoaches((current) => current.map((coach) => coach.id === statusTarget.id ? { ...coach, status: nextStatus } : coach));
    setStatusTarget(null);
    notify(`${statusTarget.name} is now ${nextStatus.toLowerCase()}.`);
  };

  const reset = () => { setQuery(""); setSport("All sports"); setStatus("All statuses"); setPage(1); };

  return (
    <DashboardShell role="head-coach" title="Coaches Management" subtitle="Demonstration data · Manage academy coaches">
      <PageHeader title="Coaches Management" description="Demonstration data · Manage coaches and sport assignments" action={<button onClick={() => setModal("add")} className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"><Plus className="h-4 w-4" />Add coach</button>} />
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total coaches" value={String(coaches.length)} detail="All demonstration records" icon="users" />
        <StatCard label="Active coaches" value={String(active)} detail="Available for assignments" icon="activity" tone="green" />
        <StatCard label="Inactive coaches" value={String(coaches.length - active)} detail="Currently unavailable" icon="users" tone="amber" />
        <StatCard label="Assigned players" value={String(assignedPlayers)} detail="Across coach assignments" icon="trophy" tone="violet" />
        <StatCard label="Sports covered" value={String(coveredSports)} detail="Of academy sports" icon="compass" tone="blue" />
      </div>
      {loading ? <LoadingState message="Loading coach records..." /> : (
        <Panel title={`Coaches (${filtered.length})`}>
          <div className="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-[minmax(220px,1fr)_220px_180px_180px_44px]">
            <label className="relative"><span className="sr-only">Search coaches</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search name or coach ID..." className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500" /></label>
            <select aria-label="Filter by sport" value={sport} onChange={(event) => { setSport(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-700"><option>All sports</option>{sports.map((item) => <option key={item}>{item}</option>)}</select>
            <select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-700"><option>All statuses</option><option>Active</option><option>Inactive</option></select>
            <select aria-label="Sort coaches" value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-700"><option value="name">Name A-Z</option><option value="players">Most players</option><option value="joined">Newest joined</option><option value="id">Coach ID</option></select>
            <button type="button" onClick={reset} aria-label="Reset filters" className="grid h-10 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"><RotateCcw className="h-4 w-4" /></button>
          </div>
          {visible.length ? <>
            <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Coach</th><th className="px-5 py-3">Contact</th><th className="px-5 py-3">Assigned sports</th><th className="px-5 py-3">Players</th><th className="px-5 py-3">Joined</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((coach) => <tr key={coach.id} className="hover:bg-slate-50/60">
              <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{coach.name.split(" ").map((part) => part[0]).join("")}</span><div><p className="font-semibold text-slate-900">{coach.name}</p><p className="text-xs text-slate-500">{coach.id}</p></div></div></td>
              <td className="px-5 py-4"><p className="text-slate-700">{coach.email}</p><p className="mt-1 text-xs text-slate-500">{coach.phone}</p></td>
              <td className="px-5 py-4"><div className="flex flex-wrap gap-1">{coach.sports.map((item) => <StatusBadge key={item} tone="blue">{item}</StatusBadge>)}</div></td>
              <td className="px-5 py-4 font-semibold text-slate-800">{coach.players}</td><td className="px-5 py-4 text-slate-600">{new Date(coach.joined).toLocaleDateString()}</td><td className="px-5 py-4"><StatusBadge tone={coach.status === "Active" ? "green" : "slate"}>{coach.status}</StatusBadge></td>
              <td className="px-5 py-4"><div className="flex gap-2"><button onClick={() => { setSelected(coach); setModal("view"); }} aria-label={`View ${coach.name}`} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600"><Eye className="h-4 w-4" /></button><button onClick={() => { setSelected(coach); setModal("edit"); }} aria-label={`Edit ${coach.name}`} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600"><Pencil className="h-4 w-4" /></button><button onClick={() => setStatusTarget(coach)} className="h-8 rounded-lg border border-slate-200 px-2 text-xs font-medium text-slate-600">{coach.status === "Active" ? "Deactivate" : "Activate"}</button></div></td>
            </tr>)}</tbody></table></div>
            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span><div className="flex items-center gap-2"><button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Previous page" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span>Page {page} of {pageCount}</span><button disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} aria-label="Next page" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>
          </> : <EmptyState title="No coaches found" description="Change the search or filters to see more results." action={<button onClick={reset} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Reset filters</button>} />}
        </Panel>
      )}
      {(modal === "add" || modal === "edit") && <Modal title={modal === "add" ? "Add coach" : `Edit ${selected.name}`} onClose={() => setModal(null)}><CoachForm coach={modal === "edit" ? selected : undefined} onCancel={() => setModal(null)} onSave={saveCoach} /></Modal>}
      {modal === "view" && <Modal title="Coach profile" onClose={() => setModal(null)}>
        <div className="p-5"><div className="flex flex-col gap-4 rounded-xl bg-slate-50 p-5 sm:flex-row sm:items-center"><span className="grid h-16 w-16 place-items-center rounded-full bg-blue-600 text-lg font-bold text-white">{selected.name.split(" ").map((part) => part[0]).join("")}</span><div><h3 className="text-lg font-bold text-slate-900">{selected.name}</h3><p className="text-sm text-slate-500">{selected.id} · Joined {new Date(selected.joined).toLocaleDateString()}</p></div><div className="sm:ml-auto"><StatusBadge tone={selected.status === "Active" ? "green" : "slate"}>{selected.status}</StatusBadge></div></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[["Email", selected.email], ["Phone", selected.phone], ["Gender", selected.gender], ["Address", selected.address], ["Assigned players", String(selected.players)], ["Joining date", new Date(selected.joined).toLocaleDateString()]].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-100 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value}</p></div>)}</div>
          <div className="mt-5 rounded-xl border border-slate-200 p-4"><p className="font-semibold text-slate-900">Assigned sports</p><div className="mt-3 flex flex-wrap gap-2">{selected.sports.map((item) => <StatusBadge key={item} tone="blue">{item}</StatusBadge>)}</div></div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">{[
            ["Recent sessions", "8 sessions this month"],
            ["Attendance activity", "96% records on time"],
            ["Match activity", "3 matches managed"],
          ].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 p-4"><ShieldCheck className="h-5 w-5 text-blue-600" /><p className="mt-3 text-sm font-semibold text-slate-900">{label}</p><p className="mt-1 text-xs text-slate-500">{value}</p></div>)}</div><div className="mt-5 flex justify-end"><button onClick={() => setModal(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Close profile</button></div></div>
      </Modal>}
      {statusTarget && <Modal title="Change coach status" onClose={() => setStatusTarget(null)}><div className="p-5"><p className="text-sm text-slate-600">{statusTarget.status === "Active" ? "Deactivate" : "Activate"} <strong className="text-slate-900">{statusTarget.name}</strong>?</p><p className="mt-2 text-xs text-slate-500">This is a local demonstration change only.</p><div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button onClick={() => setStatusTarget(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Cancel</button><button onClick={changeStatus} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">Confirm change</button></div></div></Modal>}
      {toast && <div role="status" className="fixed bottom-5 right-5 z-[60] rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">{toast}</div>}
    </DashboardShell>
  );
}
