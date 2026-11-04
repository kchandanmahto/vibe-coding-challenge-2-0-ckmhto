"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatusBadge, StatCard } from "../Dashboard";

type PlayerStatus = "Active" | "Inactive";
type PlayerReadiness = "Ready" | "Not ready";

type Player = {
  id: string;
  name: string;
  dateOfBirth: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  sport: string;
  coach: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  attendance: number;
  matches: number;
  status: PlayerStatus;
  readiness: PlayerReadiness;
};

const initialPlayers: Player[] = [
  { id: "AD-1042", name: "Arjun Patel", dateOfBirth: "2010-04-18", age: 16, gender: "Male", sport: "Football", coach: "Raj Kumar", phone: "+91 98765 41042", email: "arjun.patel@example.com", address: "12 Stadium Road, Pune", emergencyContact: "Meera Patel · +91 98765 41043", attendance: 92, matches: 12, status: "Active", readiness: "Ready" },
  { id: "AD-1088", name: "Meera Shah", dateOfBirth: "2011-02-09", age: 15, gender: "Female", sport: "Football", coach: "Raj Kumar", phone: "+91 98765 41088", email: "meera.shah@example.com", address: "8 Green Park, Pune", emergencyContact: "Anita Shah · +91 98765 41089", attendance: 88, matches: 9, status: "Active", readiness: "Ready" },
  { id: "AD-1121", name: "Vihaan Rao", dateOfBirth: "2009-07-22", age: 17, gender: "Male", sport: "Cricket", coach: "Imran Ali", phone: "+91 98765 41121", email: "vihaan.rao@example.com", address: "21 Lake View, Pune", emergencyContact: "Sanjay Rao · +91 98765 41122", attendance: 91, matches: 8, status: "Active", readiness: "Ready" },
  { id: "AD-1145", name: "Ishaan Verma", dateOfBirth: "2010-01-14", age: 16, gender: "Male", sport: "Swimming", coach: "Neha Rao", phone: "+91 98765 41145", email: "ishaan.verma@example.com", address: "44 Hill Avenue, Pune", emergencyContact: "Pooja Verma · +91 98765 41146", attendance: 86, matches: 6, status: "Active", readiness: "Ready" },
  { id: "AD-1192", name: "Kabir Singh", dateOfBirth: "2012-05-30", age: 14, gender: "Male", sport: "Athletics", coach: "Neha Rao", phone: "+91 98765 41192", email: "kabir.singh@example.com", address: "30 Sports Colony, Pune", emergencyContact: "Ravi Singh · +91 98765 41193", attendance: 68, matches: 1, status: "Inactive", readiness: "Not ready" },
  { id: "AD-1218", name: "Anaya Nair", dateOfBirth: "2011-09-11", age: 15, gender: "Female", sport: "Cricket", coach: "Imran Ali", phone: "+91 98765 41218", email: "anaya.nair@example.com", address: "17 River Street, Pune", emergencyContact: "Deepa Nair · +91 98765 41219", attendance: 74, matches: 3, status: "Active", readiness: "Not ready" },
  { id: "AD-1257", name: "Reyansh Das", dateOfBirth: "2010-11-03", age: 15, gender: "Male", sport: "Football", coach: "Raj Kumar", phone: "+91 98765 41257", email: "reyansh.das@example.com", address: "55 East Road, Pune", emergencyContact: "Mina Das · +91 98765 41258", attendance: 79, matches: 4, status: "Active", readiness: "Ready" },
];

const sports = ["Football", "Cricket", "Swimming", "Athletics", "Basketball"];
const coaches = ["Raj Kumar", "Imran Ali", "Neha Rao", "Aisha Khan"];
const pageSize = 5;

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <h2 id="modal-title" className="font-semibold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PlayerForm({ player, onCancel, onSave }: { player?: Player; onCancel: () => void; onSave: (player: Player) => void }) {
  const [error, setError] = useState("");
  const [photoName, setPhotoName] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const dateOfBirth = String(data.get("dateOfBirth") ?? "");
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const address = String(data.get("address") ?? "").trim();
    const emergencyContact = String(data.get("emergencyContact") ?? "").trim();

    if (!name || !dateOfBirth || !phone || !address || !emergencyContact) {
      setError("Please complete all required fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email) {
      setError("Enter a valid email address or leave the field empty.");
      return;
    }

    const birthDate = new Date(`${dateOfBirth}T00:00:00`);
    const today = new Date();
    const birthdayPassed =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
    const age = today.getFullYear() - birthDate.getFullYear() - (birthdayPassed ? 0 : 1);
    if (Number.isNaN(age) || age < 4 || age > 25) {
      setError("Enter a valid date of birth for a player aged 4 to 25.");
      return;
    }

    const sport = String(data.get("sport"));
    const coach = String(data.get("coach"));
    onSave({
      id: player?.id ?? `AD-${Math.floor(2000 + Math.random() * 7000)}`,
      name, dateOfBirth, age, gender: String(data.get("gender")) as Player["gender"],
      sport, coach, phone, email, address, emergencyContact,
      attendance: player?.attendance ?? 0, matches: player?.matches ?? 0,
      status: player?.status ?? "Active",
      readiness: player?.readiness ?? "Not ready",
    });
  };

  const fieldClass = "mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
  return (
    <form onSubmit={submit} className="space-y-5 p-5">
      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 sm:flex-row">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-blue-100 text-blue-700"><UserRound className="h-8 w-8" /></span>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm font-semibold text-slate-800">Profile photo</p>
          <p className="mt-1 text-xs text-slate-500">{photoName || "Optional demonstration image selection"}</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
          <Camera className="h-4 w-4" /> Choose photo
          <input type="file" accept="image/*" className="sr-only" onChange={(event) => setPhotoName(event.target.files?.[0]?.name ?? "")} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">Full name *<input name="name" defaultValue={player?.name} required className={fieldClass} /></label>
        <label className="text-sm font-medium text-slate-700">Date of birth *<input name="dateOfBirth" type="date" defaultValue={player?.dateOfBirth} required className={fieldClass} /></label>
        <label className="text-sm font-medium text-slate-700">Gender<select name="gender" defaultValue={player?.gender ?? "Male"} className={fieldClass}><option>Male</option><option>Female</option><option>Other</option></select></label>
        <label className="text-sm font-medium text-slate-700">Sport *<select name="sport" defaultValue={player?.sport ?? sports[0]} required className={fieldClass}>{sports.map((sport) => <option key={sport}>{sport}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">Assigned coach<select name="coach" defaultValue={player?.coach ?? coaches[0]} className={fieldClass}>{coaches.map((coach) => <option key={coach}>{coach}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">Phone number *<input name="phone" type="tel" defaultValue={player?.phone} required className={fieldClass} /></label>
        <label className="text-sm font-medium text-slate-700">Email<input name="email" type="email" defaultValue={player?.email} className={fieldClass} /></label>
        <label className="text-sm font-medium text-slate-700">Emergency contact *<input name="emergencyContact" defaultValue={player?.emergencyContact} required placeholder="Name · phone" className={fieldClass} /></label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">Address *<textarea name="address" defaultValue={player?.address} required rows={3} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
      </div>
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Cancel</button>
        <button type="submit" className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700">{player ? "Save changes" : "Add player"}</button>
      </div>
    </form>
  );
}

export function PlayersManagement() {
  const [players, setPlayers] = useState(initialPlayers);
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [coach, setCoach] = useState("All coaches");
  const [readiness, setReadiness] = useState("All readiness");
  const [status, setStatus] = useState("All statuses");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | "view" | null>(null);
  const [selected, setSelected] = useState<Player>(initialPlayers[0]);
  const [statusTarget, setStatusTarget] = useState<Player | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return [...players].filter((player) =>
      (!normalized || player.name.toLowerCase().includes(normalized) || player.id.toLowerCase().includes(normalized)) &&
      (sport === "All sports" || player.sport === sport) &&
      (coach === "All coaches" || player.coach === coach) &&
      (readiness === "All readiness" || player.readiness === readiness) &&
      (status === "All statuses" || player.status === status)
    ).sort((a, b) => {
      if (sort === "attendance") return b.attendance - a.attendance;
      if (sort === "matches") return b.matches - a.matches;
      if (sort === "player-id") return a.id.localeCompare(b.id);
      return a.name.localeCompare(b.name);
    });
  }, [players, query, sport, coach, readiness, status, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const readyCount = players.filter((player) => player.readiness === "Ready").length;
  const activeCount = players.filter((player) => player.status === "Active").length;
  const sportCounts = sports.map((name) => ({ name, count: players.filter((player) => player.sport === name).length })).filter((item) => item.count > 0);

  const savePlayer = (player: Player) => {
    const exists = players.some((item) => item.id === player.id);
    setPlayers((current) => exists ? current.map((item) => item.id === player.id ? player : item) : [player, ...current]);
    setModal(null);
    notify(exists ? "Player changes previewed locally." : "Player added to the local demonstration list.");
  };

  const confirmStatusChange = () => {
    if (!statusTarget) return;
    const nextStatus = statusTarget.status === "Active" ? "Inactive" : "Active";
    setPlayers((current) => current.map((player) => player.id === statusTarget.id ? { ...player, status: nextStatus } : player));
    setStatusTarget(null);
    notify(`${statusTarget.name} is now ${nextStatus.toLowerCase()}.`);
  };

  const resetFilters = () => {
    setQuery(""); setSport("All sports"); setCoach("All coaches"); setReadiness("All readiness"); setStatus("All statuses"); setPage(1);
  };

  return (
    <DashboardShell role="head-coach" title="Players Management" subtitle="Demonstration data · Manage academy players and profiles">
      <PageHeader title="Players Management" description="Demonstration data · Manage academy players and profiles" action={<button onClick={() => setModal("add")} className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"><Plus className="h-4 w-4" />Add player</button>} />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total players" value={String(players.length)} detail="All demonstration player records" icon="users" tone="blue" />
        <StatCard label="Active players" value={String(activeCount)} detail={`${players.length - activeCount} inactive player records`} icon="activity" tone="green" />
        <StatCard label="Inactive players" value={String(players.length - activeCount)} detail="Account status is inactive" icon="users" tone="amber" />
        <StatCard label="Ready players" value={String(readyCount)} detail="Meet the readiness preview criteria" icon="trophy" tone="violet" />
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        {sportCounts.map((item) => <span key={item.name} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">{item.name} <strong className="ml-1 text-slate-900">{item.count}</strong></span>)}
      </div>

      {loading ? <LoadingState message="Loading player records..." /> : (
        <Panel title={`Players (${filtered.length})`}>
          <div className="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-12">
            <label className="relative lg:col-span-3"><span className="sr-only">Search players</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search name or player ID..." className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500" /></label>
            <label className="lg:col-span-2"><span className="sr-only">Sport</span><select aria-label="Filter by Sport" value={sport} onChange={(event) => { setSport(event.target.value); setPage(1); }} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700">{["All sports", ...sports].map((option) => <option key={option}>{option}</option>)}</select></label>
            <label className="lg:col-span-2"><span className="sr-only">Coach</span><select aria-label="Filter by Coach" value={coach} onChange={(event) => { setCoach(event.target.value); setPage(1); }} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700">{["All coaches", ...coaches].map((option) => <option key={option}>{option}</option>)}</select></label>
            <label className="lg:col-span-2"><span className="sr-only">Readiness</span><select aria-label="Filter by Readiness" value={readiness} onChange={(event) => { setReadiness(event.target.value); setPage(1); }} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700">{["All readiness", "Ready", "Not ready"].map((option) => <option key={option}>{option}</option>)}</select></label>
            <label className="lg:col-span-2"><span className="sr-only">Status</span><select aria-label="Filter by Status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700">{["All statuses", "Active", "Inactive"].map((option) => <option key={option}>{option}</option>)}</select></label>
            <label className="lg:col-span-2"><span className="sr-only">Sort players</span><select aria-label="Sort players" value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700"><option value="name">Name A-Z</option><option value="attendance">Attendance</option><option value="matches">Match count</option><option value="player-id">Player ID</option></select></label>
            <button type="button" onClick={resetFilters} aria-label="Reset filters" className="grid h-10 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 lg:col-span-1"><RotateCcw className="h-4 w-4" /></button>
          </div>

          {visible.length ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Player</th><th className="px-5 py-3">Sport</th><th className="px-5 py-3">Coach</th><th className="px-5 py-3">Contact</th><th className="px-5 py-3">Attendance</th><th className="px-5 py-3">Matches</th><th className="px-5 py-3">Readiness</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {visible.map((player) => (
                      <tr key={player.id} className="hover:bg-slate-50/60">
                        <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{player.name.split(" ").map((part) => part[0]).join("")}</span><div><p className="font-semibold text-slate-900">{player.name}</p><p className="text-xs text-slate-500">{player.id} · {player.age} yrs · {player.gender}</p></div></div></td>
                        <td className="px-5 py-4 text-slate-600">{player.sport}</td><td className="px-5 py-4 text-slate-600">{player.coach}</td>
                        <td className="px-5 py-4"><p className="text-slate-700">{player.phone}</p><p className="max-w-44 truncate text-xs text-slate-500">{player.email}</p></td>
                        <td className="px-5 py-4 font-semibold text-slate-800">{player.attendance}%</td><td className="px-5 py-4 text-slate-700">{player.matches}</td>
                        <td className="px-5 py-4"><StatusBadge tone={player.readiness === "Ready" ? "green" : "amber"}>{player.readiness}</StatusBadge></td>
                        <td className="px-5 py-4"><StatusBadge tone={player.status === "Active" ? "blue" : "slate"}>{player.status}</StatusBadge></td>
                        <td className="px-5 py-4"><div className="flex gap-2"><button onClick={() => { setSelected(player); setModal("view"); }} aria-label={`View ${player.name}`} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"><Eye className="h-4 w-4" /></button><button onClick={() => { setSelected(player); setModal("edit"); }} aria-label={`Edit ${player.name}`} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"><Pencil className="h-4 w-4" /></button><button onClick={() => setStatusTarget(player)} aria-label={`Change status for ${player.name}`} className="rounded-lg border border-slate-200 px-2 text-xs font-medium text-slate-600 hover:bg-slate-50"><ChevronDown className="h-4 w-4" /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span><div className="flex items-center gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span className="px-2">Page {page} of {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>
            </>
          ) : <EmptyState title="No players found" description="Try changing the search or filters." action={<button onClick={resetFilters} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Reset filters</button>} />}
        </Panel>
      )}

      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Add new player" : `Edit ${selected.name}`} onClose={() => setModal(null)}>
          <PlayerForm player={modal === "edit" ? selected : undefined} onCancel={() => setModal(null)} onSave={savePlayer} />
        </Modal>
      )}
      {modal === "view" && (
        <Modal title="Player profile" onClose={() => setModal(null)}>
          <div className="p-5">
            <div className="flex flex-col gap-4 rounded-xl bg-slate-50 p-5 sm:flex-row sm:items-center"><span className="grid h-16 w-16 place-items-center rounded-full bg-blue-600 text-lg font-bold text-white">{selected.name.split(" ").map((part) => part[0]).join("")}</span><div><h3 className="text-lg font-bold text-slate-900">{selected.name}</h3><p className="text-sm text-slate-500">{selected.id} · {selected.sport} · {selected.age} years</p></div><div className="sm:ml-auto"><StatusBadge tone={selected.readiness === "Ready" ? "green" : "amber"}>{selected.readiness}</StatusBadge></div></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[["Date of birth", selected.dateOfBirth], ["Gender", selected.gender], ["Phone", selected.phone], ["Email", selected.email || "Not provided"], ["Coach", selected.coach], ["Attendance", `${selected.attendance}%`], ["Completed matches", String(selected.matches)], ["Account status", selected.status], ["Emergency contact", selected.emergencyContact]].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-100 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value}</p></div>)}
              <div className="rounded-lg border border-slate-100 p-3 sm:col-span-2"><p className="text-xs text-slate-500">Address</p><p className="mt-1 text-sm font-semibold text-slate-800">{selected.address}</p></div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-2 font-semibold text-slate-900"><ShieldCheck className="h-5 w-5 text-blue-600" />Readiness summary</div><p className="mt-3 text-sm text-slate-600">Attendance eligibility: {selected.attendance >= 75 ? "Met" : "Not met"}</p><p className="mt-1 text-sm text-slate-600">Match eligibility: {selected.matches >= 2 ? "Met" : "Not met"}</p></div>
              <div className="rounded-xl border border-slate-200 p-4"><p className="font-semibold text-slate-900">Recent match performance</p><div className="mt-3 flex items-center justify-between text-sm text-slate-600"><span>Latest demonstration result</span><strong className="text-slate-900">{selected.matches ? `${Math.max(72, 100 - selected.matches)} pts` : "No scores"}</strong></div><div className="mt-3"><p className="text-xs text-slate-500">Match history</p><p className="mt-1 text-sm font-medium text-slate-800">{selected.matches} completed matches</p></div></div>
            </div>
            <div className="mt-5 flex justify-end"><button onClick={() => setModal(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Close profile</button></div>
          </div>
        </Modal>
      )}
      {statusTarget && (
        <Modal title="Change player status" onClose={() => setStatusTarget(null)}>
          <div className="p-5"><p className="text-sm text-slate-600">Change <strong className="text-slate-900">{statusTarget.name}</strong> from <strong>{statusTarget.status}</strong> to <strong>{statusTarget.status === "Active" ? "Inactive" : "Active"}</strong>?</p><p className="mt-2 text-xs text-slate-500">This is a local demonstration change only.</p><div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button onClick={() => setStatusTarget(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Cancel</button><button onClick={confirmStatusChange} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">Confirm change</button></div></div>
        </Modal>
      )}
      {toast && <div role="status" className="fixed bottom-5 right-5 z-[60] rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">{toast}</div>}
    </DashboardShell>
  );
}
