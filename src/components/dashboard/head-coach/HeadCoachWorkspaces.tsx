"use client";

import { useState, type ReactNode } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Printer,
  Search,
  X,
} from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { PageHeader, EmptyState } from "../DashboardUI";
import { Panel, StatusBadge } from "../Dashboard";

export function HeadCoachPage({ title, subtitle, children, action }: { title: string; subtitle: string; children: ReactNode; action?: ReactNode }) {
  return (
    <DashboardShell role="head-coach" title={title} subtitle={subtitle}>
      <PageHeader title={title} description={subtitle} action={action} />
      {children}
    </DashboardShell>
  );
}

const players = [
  { id: "AD-1042", name: "Arjun Patel", sport: "Football", coach: "Raj Kumar", attendance: 92, matches: 12, status: "Active", ready: true, age: 16, gender: "Male" },
  { id: "AD-1088", name: "Meera Shah", sport: "Football", coach: "Raj Kumar", attendance: 88, matches: 9, status: "Active", ready: true, age: 15, gender: "Female" },
  { id: "AD-1121", name: "Vihaan Rao", sport: "Cricket", coach: "Imran Ali", attendance: 91, matches: 8, status: "Active", ready: true, age: 17, gender: "Male" },
  { id: "AD-1145", name: "Ishaan Verma", sport: "Swimming", coach: "Neha Rao", attendance: 86, matches: 6, status: "Active", ready: true, age: 16, gender: "Male" },
  { id: "AD-1192", name: "Kabir Singh", sport: "Athletics", coach: "Neha Rao", attendance: 68, matches: 1, status: "Inactive", ready: false, age: 14, gender: "Male" },
];

const coaches = [
  { name: "Raj Kumar", sports: "Football, Athletics", players: 48, email: "raj@academy.example", status: "Active" },
  { name: "Neha Rao", sports: "Swimming, Athletics", players: 31, email: "neha@academy.example", status: "Active" },
  { name: "Imran Ali", sports: "Cricket", players: 36, email: "imran@academy.example", status: "Active" },
  { name: "Aisha Khan", sports: "Basketball", players: 19, email: "aisha@academy.example", status: "On leave" },
];

const sports = [
  { name: "Football", category: "Team", coaches: 4, players: 68, description: "Skills, fitness and competitive team development.", status: "Active" },
  { name: "Cricket", category: "Team", coaches: 3, players: 54, description: "Batting, bowling and fielding development.", status: "Active" },
  { name: "Swimming", category: "Individual", coaches: 2, players: 32, description: "Technique and endurance training.", status: "Active" },
  { name: "Athletics", category: "Individual", coaches: 3, players: 41, description: "Track, field and speed conditioning.", status: "Active" },
  { name: "Basketball", category: "Team", coaches: 2, players: 29, description: "Team play and skill development.", status: "Inactive" },
];

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 id="modal-title" className="font-semibold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function useToast() {
  const [toast, setToast] = useState("");
  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };
  return { toast, showToast };
}

function Toast({ message }: { message: string }) {
  if (!message) return null;
  return <div role="status" className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl"><CheckCircle2 className="h-5 w-5 text-emerald-400" />{message}</div>;
}

function Toolbar({ query, setQuery, placeholder, children }: { query: string; setQuery: (value: string) => void; placeholder: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
      <label className="relative flex-1">
        <span className="sr-only">{placeholder}</span>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
      </label>
      {children}
    </div>
  );
}

export function PlayersWorkspace() {
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [status, setStatus] = useState("All statuses");
  const [coach, setCoach] = useState("All coaches");
  const [modal, setModal] = useState<"add" | "edit" | "view" | null>(null);
  const [selected, setSelected] = useState(players[0]);
  const { toast, showToast } = useToast();
  const filtered = players.filter((player) =>
    player.name.toLowerCase().includes(query.toLowerCase()) &&
    (sport === "All sports" || player.sport === sport) &&
    (status === "All statuses" || player.status === status) &&
    (coach === "All coaches" || player.coach === coach));

  const submit = (message: string) => { setModal(null); showToast(message); };

  return (
    <HeadCoachPage title="Players Management" subtitle="Demonstration data · Manage academy players and profiles">
      <div className="mb-5 flex justify-end"><button onClick={() => setModal("add")} className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"><Plus className="h-4 w-4" />Add player</button></div>
      <Panel title={`Players (${filtered.length})`}>
        <Toolbar query={query} setQuery={setQuery} placeholder="Search players by name...">
          {[["Sport", sport, setSport, ["All sports", "Football", "Cricket", "Swimming", "Athletics"]], ["Status", status, setStatus, ["All statuses", "Active", "Inactive"]], ["Coach", coach, setCoach, ["All coaches", "Raj Kumar", "Neha Rao", "Imran Ali"]]].map(([label, value, setter, options]) => (
            <select key={String(label)} aria-label={`Filter by ${label}`} value={String(value)} onChange={(event) => (setter as (value: string) => void)(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm">{(options as string[]).map((option) => <option key={option}>{option}</option>)}</select>
          ))}
        </Toolbar>
        {filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Player</th><th className="px-5 py-3">Sport</th><th className="px-5 py-3">Coach</th><th className="px-5 py-3">Attendance</th><th className="px-5 py-3">Matches</th><th className="px-5 py-3">Readiness</th><th className="px-5 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((player) => <tr key={player.id}><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{player.name.split(" ").map((n) => n[0]).join("")}</span><div><p className="font-medium text-slate-800">{player.name}</p><p className="text-xs text-slate-500">{player.id} · {player.age} yrs · {player.gender}</p></div></div></td><td className="px-5 py-4 text-slate-600">{player.sport}</td><td className="px-5 py-4 text-slate-600">{player.coach}</td><td className="px-5 py-4 font-semibold">{player.attendance}%</td><td className="px-5 py-4">{player.matches}</td><td className="px-5 py-4"><StatusBadge tone={player.ready ? "green" : "amber"}>{player.ready ? "Ready" : "Not ready"}</StatusBadge></td><td className="px-5 py-4"><button onClick={() => { setSelected(player); setModal("view"); }} aria-label={`View ${player.name}`} className="mr-2 rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Eye className="h-4 w-4" /></button><button onClick={() => { setSelected(player); setModal("edit"); }} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-medium hover:bg-slate-50">Edit</button></td></tr>)}</tbody></table></div> : <EmptyState title="No players found" description="Try changing the search or filters." />}
        <Pagination />
      </Panel>
      {(modal === "add" || modal === "edit") && <Modal title={modal === "add" ? "Add new player" : `Edit ${selected.name}`} onClose={() => setModal(null)}><PlayerForm button={modal === "add" ? "Add player" : "Save changes"} onSubmit={() => submit(modal === "add" ? "Player preview added locally." : "Player changes previewed locally.")} /></Modal>}
      {modal === "view" && <Modal title="Player profile" onClose={() => setModal(null)}><div className="grid grid-cols-2 gap-4 text-sm"><ProfileItem label="Player" value={selected.name} /><ProfileItem label="Academy ID" value={selected.id} /><ProfileItem label="Sport" value={selected.sport} /><ProfileItem label="Coach" value={selected.coach} /><ProfileItem label="Attendance" value={`${selected.attendance}%`} /><ProfileItem label="Matches" value={String(selected.matches)} /></div></Modal>}
      <Toast message={toast} />
    </HeadCoachPage>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-800">{value}</p></div>; }
function Pagination() { return <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500"><span>Showing mock results</span><div className="flex gap-2"><button aria-label="Previous page" className="grid h-8 w-8 place-items-center rounded border border-slate-200"><ChevronLeft className="h-4 w-4" /></button><button aria-label="Next page" className="grid h-8 w-8 place-items-center rounded border border-slate-200"><ChevronRight className="h-4 w-4" /></button></div></div>; }

function PlayerForm({ button, onSubmit }: { button: string; onSubmit: () => void }) {
  return <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }} className="grid gap-4 sm:grid-cols-2">
    {[["Full name", "name", "text"], ["Email / contact", "email", "text"], ["Date of birth", "dob", "date"], ["Emergency contact", "emergency", "tel"]].map(([label, name, type]) => <label key={name} className="text-sm font-medium text-slate-700">{label}<input required name={name} type={type} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none focus:border-blue-500" /></label>)}
    <label className="text-sm font-medium text-slate-700">Sport<select required className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 font-normal"><option>Football</option><option>Cricket</option><option>Swimming</option></select></label>
    <label className="text-sm font-medium text-slate-700">Gender<select className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 font-normal"><option>Male</option><option>Female</option><option>Other</option></select></label>
    <button className="sm:col-span-2 h-11 rounded-lg bg-blue-600 text-sm font-semibold text-white">{button}</button>
  </form>;
}

export function CoachesWorkspace() {
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | "view" | null>(null);
  const [selected, setSelected] = useState(coaches[0]);
  const [sport, setSport] = useState("All sports");
  const { toast, showToast } = useToast();
  const filtered = coaches.filter((coach) => coach.name.toLowerCase().includes(query.toLowerCase()) && (sport === "All sports" || coach.sports.includes(sport)));
  const submit = () => { setModal(null); showToast("Coach changes saved in the local preview."); };
  return <HeadCoachPage title="Coaches Management" subtitle="Demonstration data · Manage coaches and sport assignments">
    <div className="mb-5 flex justify-end"><button onClick={() => setModal("add")} className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Add coach</button></div>
    <Panel title={`Coaches (${filtered.length})`}><Toolbar query={query} setQuery={setQuery} placeholder="Search coaches..."><select value={sport} onChange={(event) => setSport(event.target.value)} aria-label="Filter coaches by sport" className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All sports</option><option>Football</option><option>Cricket</option><option>Swimming</option><option>Basketball</option></select></Toolbar>
      {filtered.length ? <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map((coach) => <article key={coach.name} className="rounded-xl border border-slate-200 p-4"><div className="flex items-start justify-between"><div className="grid h-12 w-12 place-items-center rounded-full bg-blue-100 font-bold text-blue-700">{coach.name.split(" ").map((part) => part[0]).join("")}</div><StatusBadge tone={coach.status === "Active" ? "green" : "amber"}>{coach.status}</StatusBadge></div><h3 className="mt-4 font-semibold text-slate-900">{coach.name}</h3><p className="mt-1 text-xs text-slate-500">{coach.email}</p><p className="mt-4 text-sm text-slate-600">{coach.sports}</p><p className="mt-2 text-xs text-slate-500">{coach.players} assigned players</p><div className="mt-4 flex gap-2"><button onClick={() => { setSelected(coach); setModal("view"); }} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm">View</button><button onClick={() => { setSelected(coach); setModal("edit"); }} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm">Edit</button></div></article>)}</div> : <EmptyState title="No coaches found" description="Change the search or sport filter." />}
      <Pagination /></Panel>
    {(modal === "add" || modal === "edit") && <Modal title={modal === "add" ? "Add coach" : `Edit ${selected.name}`} onClose={() => setModal(null)}><form onSubmit={(event) => { event.preventDefault(); submit(); }} className="grid gap-4"><label className="text-sm font-medium">Full name<input required defaultValue={modal === "edit" ? selected.name : ""} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 font-normal" /></label><label className="text-sm font-medium">Email<input required type="email" defaultValue={modal === "edit" ? selected.email : ""} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 font-normal" /></label><fieldset><legend className="mb-2 text-sm font-medium">Assigned sports</legend><div className="grid grid-cols-2 gap-2">{["Football", "Cricket", "Swimming", "Athletics", "Basketball"].map((item) => <label key={item} className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm"><input type="checkbox" defaultChecked={modal === "edit" && selected.sports.includes(item)} />{item}</label>)}</div></fieldset><button className="h-11 rounded-lg bg-blue-600 text-sm font-semibold text-white">{modal === "add" ? "Add coach" : "Save changes"}</button></form></Modal>}
    {modal === "view" && <Modal title="Coach profile" onClose={() => setModal(null)}><div className="grid grid-cols-2 gap-4"><ProfileItem label="Coach" value={selected.name} /><ProfileItem label="Email" value={selected.email} /><ProfileItem label="Sports" value={selected.sports} /><ProfileItem label="Players" value={String(selected.players)} /></div></Modal>}
    <Toast message={toast} />
  </HeadCoachPage>;
}

export function SportsWorkspace() {
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | "view" | null>(null);
  const [selected, setSelected] = useState(sports[0]);
  const [filter, setFilter] = useState("All statuses");
  const { toast, showToast } = useToast();
  const filtered = sports.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()) && (filter === "All statuses" || item.status === filter));
  const submit = () => { setModal(null); showToast("Sport changes saved in the local preview."); };
  return <HeadCoachPage title="Sports Management" subtitle="Demonstration data · Manage academy sports">
    <div className="mb-5 flex justify-end"><button onClick={() => setModal("add")} className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Add sport</button></div>
    <Panel title={`Sports (${filtered.length})`}><Toolbar query={query} setQuery={setQuery} placeholder="Search sports..."><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter sports by status" className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All statuses</option><option>Active</option><option>Inactive</option></select></Toolbar>
      {filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Sport</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Coaches</th><th className="px-5 py-3">Players</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((item) => <tr key={item.name}><td className="px-5 py-4 font-medium text-slate-800">{item.name}<p className="mt-1 max-w-xs truncate text-xs font-normal text-slate-500">{item.description}</p></td><td className="px-5 py-4 text-slate-600">{item.category}</td><td className="px-5 py-4">{item.coaches}</td><td className="px-5 py-4">{item.players}</td><td className="px-5 py-4"><StatusBadge tone={item.status === "Active" ? "green" : "slate"}>{item.status}</StatusBadge></td><td className="px-5 py-4"><button onClick={() => { setSelected(item); setModal("view"); }} className="mr-2 rounded-lg border border-slate-200 px-2 py-1 text-xs">View</button><button onClick={() => { setSelected(item); setModal("edit"); }} className="rounded-lg border border-slate-200 px-2 py-1 text-xs">Edit</button></td></tr>)}</tbody></table></div> : <EmptyState title="No sports found" description="Change the search or status filter." />}<Pagination /></Panel>
    {(modal === "add" || modal === "edit") && <Modal title={modal === "add" ? "Add sport" : `Edit ${selected.name}`} onClose={() => setModal(null)}><form onSubmit={(event) => { event.preventDefault(); submit(); }} className="grid gap-4"><label className="text-sm font-medium">Sport name<input required defaultValue={modal === "edit" ? selected.name : ""} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 font-normal" /></label><label className="text-sm font-medium">Category<select defaultValue={modal === "edit" ? selected.category : "Team"} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 font-normal"><option>Team</option><option>Individual</option></select></label><label className="text-sm font-medium">Description<textarea required defaultValue={modal === "edit" ? selected.description : ""} rows={3} className="mt-1 w-full rounded-lg border border-slate-200 p-3 font-normal" /></label><button className="h-11 rounded-lg bg-blue-600 text-sm font-semibold text-white">{modal === "add" ? "Add sport" : "Save changes"}</button></form></Modal>}
    {modal === "view" && <Modal title="Sport details" onClose={() => setModal(null)}><div className="grid gap-4"><ProfileItem label="Sport" value={selected.name} /><ProfileItem label="Description" value={selected.description} /><div className="grid grid-cols-3 gap-3"><ProfileItem label="Category" value={selected.category} /><ProfileItem label="Coaches" value={String(selected.coaches)} /><ProfileItem label="Players" value={String(selected.players)} /></div></div></Modal>}
    <Toast message={toast} />
  </HeadCoachPage>;
}

const sessions = [
  { id: "SES-104", sport: "Football", date: "04 Nov 2026", time: "06:30 AM", status: "Closed", players: 18 },
  { id: "SES-105", sport: "Cricket", date: "04 Nov 2026", time: "04:00 PM", status: "Open", players: 16 },
  { id: "SES-106", sport: "Swimming", date: "05 Nov 2026", time: "07:00 AM", status: "Open", players: 12 },
  { id: "SES-107", sport: "Athletics", date: "06 Nov 2026", time: "05:30 PM", status: "Closed", players: 14 },
];

export function SessionsWorkspace() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState<typeof sessions[number] | null>(null);
  const { toast, showToast } = useToast();
  const filtered = sessions.filter((item) => item.sport.toLowerCase().includes(query.toLowerCase()) && (status === "All statuses" || item.status === status));
  return <HeadCoachPage title="Sessions" subtitle="Demonstration data · Create and review practice sessions">
    <div className="mb-5 flex justify-end"><button onClick={() => setModal(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Create session</button></div>
    <Panel title={`Sessions (${filtered.length})`}><Toolbar query={query} setQuery={setQuery} placeholder="Search by sport..."><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All statuses</option><option>Open</option><option>Closed</option></select></Toolbar>
      <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Session</th><th className="px-5 py-3">Sport</th><th className="px-5 py-3">Date & time</th><th className="px-5 py-3">Players</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((item) => <tr key={item.id}><td className="px-5 py-4 font-medium">{item.id}</td><td className="px-5 py-4 text-slate-600">{item.sport}</td><td className="px-5 py-4 text-slate-600">{item.date} · {item.time}</td><td className="px-5 py-4">{item.players}</td><td className="px-5 py-4"><StatusBadge tone={item.status === "Open" ? "blue" : "slate"}>{item.status}</StatusBadge></td><td className="px-5 py-4"><button onClick={() => setSelected(item)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs">View details</button></td></tr>)}</tbody></table></div><Pagination /></Panel>
    {modal && <Modal title="Create session" onClose={() => setModal(false)}><form onSubmit={(event) => { event.preventDefault(); setModal(false); showToast("Session created in the local preview."); }} className="grid gap-4"><label className="text-sm font-medium">Sport<select required className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 font-normal"><option>Football</option><option>Cricket</option><option>Swimming</option><option>Basketball</option></select></label><label className="text-sm font-medium">Session date<input required type="date" className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 font-normal" /></label><label className="text-sm font-medium">Start time<input required type="time" className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 font-normal" /></label><button className="h-11 rounded-lg bg-blue-600 text-sm font-semibold text-white">Create session</button></form></Modal>}
    {selected && <Modal title={`Session ${selected.id}`} onClose={() => setSelected(null)}><div className="grid grid-cols-2 gap-4"><ProfileItem label="Sport" value={selected.sport} /><ProfileItem label="Status" value={selected.status} /><ProfileItem label="Date" value={selected.date} /><ProfileItem label="Assigned players" value={String(selected.players)} /><div className="col-span-2"><button onClick={() => { setSelected(null); showToast(selected.status === "Closed" ? "Reopening requires authorization in the future integration." : "Session closed in the local preview."); }} className="h-10 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white">{selected.status === "Closed" ? "Request reopening" : "Close session"}</button></div></div></Modal>}
    <Toast message={toast} />
  </HeadCoachPage>;
}

export function AttendanceWorkspace() {
  const [session, setSession] = useState("SES-105 · Cricket");
  const [sport, setSport] = useState("All sports");
  const [reopen, setReopen] = useState(false);
  const [attendance, setAttendance] = useState<Record<string, "Present" | "Absent">>({ "Arjun Patel": "Present", "Meera Shah": "Present", "Vihaan Rao": "Absent", "Ishaan Verma": "Present" });
  const { toast, showToast } = useToast();
  return <HeadCoachPage title="Attendance" subtitle="Demonstration data · Mark and review session attendance">
    <div className="mb-5 grid gap-4 md:grid-cols-3"><select value={session} onChange={(event) => setSession(event.target.value)} className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm"><option>SES-105 · Cricket</option><option>SES-106 · Swimming</option><option>SES-104 · Football</option></select><select value={sport} onChange={(event) => setSport(event.target.value)} className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm"><option>All sports</option><option>Football</option><option>Cricket</option><option>Swimming</option></select><button onClick={() => setReopen(true)} className="h-11 rounded-lg border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-700">Reopen with reason</button></div>
    <Panel title={`${session} attendance`}><div className="divide-y divide-slate-100">{Object.entries(attendance).map(([name, value]) => <div key={name} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"><span className="flex-1 font-medium text-slate-800">{name}</span><div className="flex rounded-lg bg-slate-100 p-1">{(["Present", "Absent"] as const).map((status) => <button key={status} onClick={() => setAttendance((current) => ({ ...current, [name]: status }))} className={`rounded-md px-4 py-2 text-xs font-semibold ${value === status ? status === "Present" ? "bg-white text-emerald-700 shadow-sm" : "bg-white text-red-700 shadow-sm" : "text-slate-500"}`}>{status}</button>)}</div></div>)}</div><div className="flex justify-end border-t border-slate-100 p-4"><button onClick={() => showToast("Attendance saved in the local preview.")} className="h-10 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white">Save attendance</button></div></Panel>
    {reopen && <Modal title="Reopen closed attendance" onClose={() => setReopen(false)}><form onSubmit={(event) => { event.preventDefault(); setReopen(false); showToast("Reopening request recorded in the local preview."); }} className="grid gap-4"><div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Closed attendance requires Head Coach authorization and a mandatory reason.</div><label className="text-sm font-medium">Reason<textarea required minLength={10} rows={4} className="mt-1 w-full rounded-lg border border-slate-200 p-3 font-normal" /></label><button className="h-11 rounded-lg bg-blue-600 text-sm font-semibold text-white">Confirm reopening</button></form></Modal>}
    <Toast message={toast} />
  </HeadCoachPage>;
}

const matches = [
  { title: "District Football League", sport: "Football", date: "18 Oct 2026", opponent: "Rising Stars FC", result: "Won 3-1", status: "Completed" },
  { title: "Academy Championship", sport: "Cricket", date: "04 Oct 2026", opponent: "City Academy", result: "Draw 2-2", status: "Completed" },
  { title: "Junior Cup", sport: "Swimming", date: "21 Sep 2026", opponent: "Blue Dolphins", result: "Upcoming", status: "Scheduled" },
];

export function MatchesWorkspace() {
  const [modal, setModal] = useState(false);
  const [query, setQuery] = useState("");
  const { toast, showToast } = useToast();
  const filtered = matches.filter((item) => `${item.title} ${item.sport}`.toLowerCase().includes(query.toLowerCase()));
  return <HeadCoachPage title="Matches" subtitle="Demonstration data · Match records and player scores">
    <div className="mb-5 flex justify-end"><button onClick={() => setModal(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Create match</button></div>
    <Panel title={`Matches (${filtered.length})`}><Toolbar query={query} setQuery={setQuery} placeholder="Search matches or sport..." />
      <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Match</th><th className="px-5 py-3">Sport</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Opponent</th><th className="px-5 py-3">Result</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((item) => <tr key={item.title}><td className="px-5 py-4 font-medium">{item.title}</td><td className="px-5 py-4 text-slate-600">{item.sport}</td><td className="px-5 py-4 text-slate-600">{item.date}</td><td className="px-5 py-4 text-slate-600">{item.opponent}</td><td className="px-5 py-4 font-semibold">{item.result}</td><td className="px-5 py-4"><StatusBadge tone={item.status === "Completed" ? "green" : "blue"}>{item.status}</StatusBadge></td></tr>)}</tbody></table></div><Pagination /></Panel>
    {modal && <Modal title="Create match" onClose={() => setModal(false)}><form onSubmit={(event) => { event.preventDefault(); setModal(false); showToast("Match created in the local preview."); }} className="grid gap-4"><label className="text-sm font-medium">Match title<input required className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 font-normal" /></label><div className="grid grid-cols-2 gap-4"><label className="text-sm font-medium">Sport<select className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 font-normal"><option>Football</option><option>Cricket</option><option>Swimming</option></select></label><label className="text-sm font-medium">Match date<input required type="date" className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 font-normal" /></label></div><label className="text-sm font-medium">Opponent<input required className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 font-normal" /></label><div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">Demo eligibility uses recorded attendance: players marked absent in the documented relevant session are excluded. The current matches schema has no session linkage; this must be added before API integration.</div><fieldset><legend className="mb-2 text-sm font-medium">Eligible players & scores</legend>{players.filter((player) => player.attendance >= 75).slice(0, 4).map((player) => <label key={player.id} className="flex items-center gap-3 border-b border-slate-100 py-2 text-sm"><input type="checkbox" /><span className="flex-1">{player.name}</span><input aria-label={`${player.name} score`} type="number" min="0" className="h-9 w-20 rounded border border-slate-200 px-2" /></label>)}</fieldset><button className="h-11 rounded-lg bg-blue-600 text-sm font-semibold text-white">Create match</button></form></Modal>}
    <Toast message={toast} />
  </HeadCoachPage>;
}

export function PerformanceWorkspace() {
  const [sport, setSport] = useState("All sports");
  const [query, setQuery] = useState("");
  const filtered = players.filter((player) => (sport === "All sports" || player.sport === sport) && player.name.toLowerCase().includes(query.toLowerCase()));
  return <HeadCoachPage title="Performance" subtitle="Demonstration data · Player and sport performance">
    <div className="mb-5 grid gap-4 sm:grid-cols-3"><ProfileItem label="Top performance" value="84/100" /><ProfileItem label="Matches recorded" value="36" /><ProfileItem label="Average score" value="78/100" /></div>
    <Panel title="Player performance"><Toolbar query={query} setQuery={setQuery} placeholder="Search players..."><select value={sport} onChange={(event) => setSport(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All sports</option><option>Football</option><option>Cricket</option><option>Swimming</option><option>Athletics</option></select></Toolbar>
      {filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Player</th><th className="px-5 py-3">Sport</th><th className="px-5 py-3">Attendance</th><th className="px-5 py-3">Matches</th><th className="px-5 py-3">Performance</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((player, index) => <tr key={player.id}><td className="px-5 py-4 font-medium">{player.name}</td><td className="px-5 py-4 text-slate-600">{player.sport}</td><td className="px-5 py-4">{player.attendance}%</td><td className="px-5 py-4">{player.matches}</td><td className="px-5 py-4"><div className="flex items-center gap-2"><div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-blue-600" style={{ width: `${84 - index * 6}%` }} /></div><span>{84 - index * 6}</span></div></td></tr>)}</tbody></table></div> : <EmptyState title="No performance records" description="Try another player search or sport." />}<Pagination /></Panel>
  </HeadCoachPage>;
}

export function ReadinessWorkspace() {
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All sports");
  const [selected, setSelected] = useState<typeof players[number] | null>(null);
  const filtered = players.filter((player) => player.name.toLowerCase().includes(query.toLowerCase()) && (sport === "All sports" || player.sport === sport));
  return <HeadCoachPage title="Ready Players" subtitle="Readiness requires 75% attendance and at least 2 completed matches">
    <Panel title={`Readiness list (${filtered.length})`}><Toolbar query={query} setQuery={setQuery} placeholder="Search ready players..."><select value={sport} onChange={(event) => setSport(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All sports</option><option>Football</option><option>Cricket</option><option>Swimming</option><option>Athletics</option></select></Toolbar><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm">    <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Player</th><th className="px-5 py-3">Sport</th><th className="px-5 py-3">Attendance</th><th className="px-5 py-3">Completed matches</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Profile</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((player) => <tr key={player.id}><td className="px-5 py-4 font-medium">{player.name}</td><td className="px-5 py-4 text-slate-600">{player.sport}</td><td className="px-5 py-4">{player.attendance}%</td><td className="px-5 py-4">{player.matches}</td><td className="px-5 py-4"><StatusBadge tone={player.ready ? "green" : "amber"}>{player.ready ? "Ready" : "Not Ready"}</StatusBadge></td><td className="px-5 py-4"><button onClick={() => setSelected(player)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs">View</button></td></tr>)}</tbody></table></div></Panel>
    {selected && <Modal title="Player readiness profile" onClose={() => setSelected(null)}><div className="grid grid-cols-2 gap-4"><ProfileItem label="Player" value={selected.name} /><ProfileItem label="Sport" value={selected.sport} /><ProfileItem label="Attendance" value={`${selected.attendance}% (${selected.attendance >= 75 ? "meets" : "does not meet"})`} /><ProfileItem label="Matches" value={`${selected.matches} (${selected.matches >= 2 ? "meets" : "does not meet"})`} /></div></Modal>}
  </HeadCoachPage>;
}

export function ReportsWorkspace() {
  const [report, setReport] = useState("Academy Summary");
  const [from, setFrom] = useState("2026-10-01");
  const [to, setTo] = useState("2026-11-04");
  const reports = ["Academy Summary", "Player Reports", "Attendance Reports", "Match Reports", "Sport-wise Reports", "Performance Summaries"];
  return <HeadCoachPage title="Reports" subtitle="Demonstration data · Preview and print academy reports" action={<button onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"><Printer className="h-4 w-4" />Print report</button>}>
    <div className="grid gap-5 xl:grid-cols-[240px_1fr] print:block">
      <aside className="rounded-xl border border-slate-200 bg-white p-2 print:hidden"><nav>{reports.map((item) => <button key={item} onClick={() => setReport(item)} className={`w-full rounded-lg px-3 py-2.5 text-left text-sm ${report === item ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>{item}</button>)}</nav></aside>
      <Panel title={`${report} · Report preview`}><div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row print:hidden"><label className="text-xs font-medium text-slate-500">From<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1 block h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-800" /></label><label className="text-xs font-medium text-slate-500">To<input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="mt-1 block h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-800" /></label></div><div className="p-6"><div className="border-b border-slate-200 pb-5"><p className="text-xs uppercase tracking-wider text-slate-400">Academy Desk · Demo report</p><h2 className="mt-2 text-xl font-bold text-slate-900">{report}</h2><p className="mt-1 text-sm text-slate-500">{from} to {to}</p></div><div className="mt-5 grid gap-4 sm:grid-cols-3"><ProfileItem label="Players" value="248" /><ProfileItem label="Attendance" value="86%" /><ProfileItem label="Matches" value="36 completed" /></div><div className="mt-6"><h3 className="font-semibold text-slate-900">Report notes</h3><p className="mt-2 text-sm leading-6 text-slate-600">This print-friendly preview uses demonstration academy data. Connect to verified academy records only when reporting APIs are implemented.</p></div></div></Panel>
    </div>
  </HeadCoachPage>;
}

export function SettingsWorkspace() {
  const [active, setActive] = useState("Academy profile");
  const [emailNotice, setEmailNotice] = useState(true);
  const [matchNotice, setMatchNotice] = useState(true);
  const [compact, setCompact] = useState(false);
  const { toast, showToast } = useToast();
  const tabs = ["Academy profile", "Head Coach profile", "Notifications", "Display"];
  return <HeadCoachPage title="Settings" subtitle="Demonstration preferences · Local frontend only">
    <div className="grid gap-5 lg:grid-cols-[220px_1fr]"><aside className="h-fit rounded-xl border border-slate-200 bg-white p-2">{tabs.map((tab) => <button key={tab} onClick={() => setActive(tab)} className={`w-full rounded-lg px-3 py-2.5 text-left text-sm ${active === tab ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>{tab}</button>)}</aside>
      <Panel title={active}>{active === "Notifications" ? <div className="divide-y divide-slate-100 p-5">{[["Email notifications", emailNotice, setEmailNotice], ["Match updates", matchNotice, setMatchNotice]].map(([label, value, setter]) => <label key={String(label)} className="flex items-center justify-between py-4 text-sm font-medium text-slate-800"><span>{String(label)}</span><input type="checkbox" checked={Boolean(value)} onChange={(event) => (setter as (value: boolean) => void)(event.target.checked)} className="h-4 w-4 accent-blue-600" /></label>)}</div> : active === "Display" ? <div className="p-5"><label className="flex items-center justify-between text-sm font-medium text-slate-800"><span>Compact dashboard density</span><input type="checkbox" checked={compact} onChange={(event) => setCompact(event.target.checked)} className="h-4 w-4 accent-blue-600" /></label></div> : <form onSubmit={(event) => { event.preventDefault(); showToast("Preferences previewed locally."); }} className="grid gap-4 p-5 md:grid-cols-2">{(active === "Academy profile" ? [["Academy name", "Academy Desk Sports Academy"], ["Contact email", "contact@academy.example"], ["Phone", "+91 98765 43210"], ["Address", "Demo academy address"]] : [["Name", "Raj Kumar"], ["Email", "raj@academy.example"], ["Phone", "+91 98765 43210"], ["Role", "Head Coach"]]).map(([label, value]) => <label key={label} className="text-sm font-medium text-slate-700">{label}<input required defaultValue={value} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 font-normal" /></label>)}<button className="h-11 rounded-lg bg-blue-600 text-sm font-semibold text-white md:col-span-2">Save preferences</button></form>}</Panel>
    </div><Toast message={toast} />
  </HeadCoachPage>;
}
