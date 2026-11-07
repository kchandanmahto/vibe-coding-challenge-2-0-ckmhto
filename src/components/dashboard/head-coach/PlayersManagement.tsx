
"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ChevronDown, ChevronLeft, ChevronRight, Eye, Pencil, Plus,
  RotateCcw, Search, ShieldCheck, UserRound, X, Camera,
} from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { EmptyState, LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatusBadge, StatCard } from "../Dashboard";

type Status = "ACTIVE" | "INACTIVE" | "SUSPENDED";
type Gender = "MALE" | "FEMALE" | "OTHER";

type Player = {
  id: string;
  playerCode: string;
  name: string;
  dateOfBirth: string;
  age: number;
  gender: Gender;
  sportId: string;
  sport: string;
  coachId: string;
  coach: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  status: Status;
};

type SportOption = { id: string; name: string };
type CoachOption = {
  id: string;
  name: string;
  email?: string;
  sportId?: string;
};

type PlayerFormData = {
  name: string;
  dateOfBirth: string;
  gender: Gender;
  sportId: string;
  coachId: string;
  phone: string;
  email: string;
  address: string;
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
};

const PAGE_SIZE = 5;

function calculateAge(date: string) {
  if (!date) return 0;
  const birth = new Date(date);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) age--;
  return age;
}

function displayDate(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function getId(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "_id" in value) {
    return String((value as { _id: unknown })._id);
  }
  return "";
}

function getName(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  if ("name" in value) return String((value as { name: unknown }).name ?? "");
  return "";
}

function mapPlayer(raw: Record<string, unknown>): Player {
  const emergency = (
    raw.emergencyContact && typeof raw.emergencyContact === "object"
      ? raw.emergencyContact
      : {}
  ) as Record<string, unknown>;

  const dob = raw.dateOfBirth
    ? new Date(String(raw.dateOfBirth)).toISOString().slice(0, 10)
    : "";

  return {
    id: String(raw._id ?? ""),
    playerCode: String(raw.playerCode ?? "—"),
    name: String(raw.name ?? ""),
    dateOfBirth: dob,
    age: calculateAge(dob),
    gender: String(raw.gender ?? "OTHER").toUpperCase() as Gender,
    sportId: getId(raw.sportId),
    sport: getName(raw.sportId) || "—",
    coachId: getId(raw.coachId),
    coach: getName(raw.coachId) || "Not assigned",
    phone: String(raw.phone ?? ""),
    email: String(raw.email ?? ""),
    address: String(raw.address ?? ""),
    emergencyContact: {
      name: String(emergency.name ?? ""),
      relationship: String(emergency.relationship ?? ""),
      phone: String(emergency.phone ?? ""),
    },
    status: String(raw.status ?? "ACTIVE").toUpperCase() as Status,
  };
}

function errorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "message" in data) {
    return String((data as { message: unknown }).message);
  }
  return fallback;
}

function Modal({
  title, onClose, children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PlayerForm({
  player,
  sports,
  coaches,
  onCancel,
  onSave,
}: {
  player?: Player;
  sports: SportOption[];
  coaches: CoachOption[];
  onCancel: () => void;
  onSave: (data: PlayerFormData) => Promise<void>;
}) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [photoName, setPhotoName] = useState("");

  const [form, setForm] = useState<PlayerFormData>({
    name: player?.name ?? "",
    dateOfBirth: player?.dateOfBirth ?? "",
    gender: player?.gender ?? "MALE",
    sportId: player?.sportId ?? sports[0]?.id ?? "",
    coachId: player?.coachId ?? "",
    phone: player?.phone ?? "",
    email: player?.email ?? "",
    address: player?.address ?? "",
    emergencyName: player?.emergencyContact.name ?? "",
    emergencyRelationship: player?.emergencyContact.relationship ?? "",
    emergencyPhone: player?.emergencyContact.phone ?? "",
  });

  const availableCoaches = useMemo(
    () => coaches.filter((item) => !item.sportId || item.sportId === form.sportId),
    [coaches, form.sportId],
  );

  function update<K extends keyof PlayerFormData>(key: K, value: PlayerFormData[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.dateOfBirth || !form.sportId) {
      setError("Please complete the required fields.");
      return;
    }

    const age = calculateAge(form.dateOfBirth);
    if (age < 4 || age > 25) {
      setError("Player age must be between 4 and 25 years.");
      return;
    }

    if (!player && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("A valid player email address is required.");
      return;
    }

    if (!form.emergencyName.trim() || !form.emergencyPhone.trim()) {
      setError("Emergency contact name and phone are required.");
      return;
    }

    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save player.");
    } finally {
      setSaving(false);
    }
  }

  const fieldClass =
    "mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <form onSubmit={submit} className="space-y-5 p-5">
      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 sm:flex-row">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-blue-100 text-blue-700">
          <UserRound className="h-8 w-8" />
        </span>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm font-semibold text-slate-800">Profile photo</p>
          <p className="mt-1 text-xs text-slate-500">
            {photoName || "Photo upload is not connected yet"}
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
          <Camera className="h-4 w-4" /> Choose photo
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => setPhotoName(event.target.files?.[0]?.name ?? "")}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Full name *
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
            className={fieldClass}
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Date of birth *
          <input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => update("dateOfBirth", e.target.value)}
            required
            className={fieldClass}
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Gender *
          <select
            value={form.gender}
            onChange={(e) => update("gender", e.target.value as Gender)}
            className={fieldClass}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Sport *
          <select
            value={form.sportId}
            onChange={(e) => {
              update("sportId", e.target.value);
              update("coachId", "");
            }}
            required
            className={fieldClass}
          >
            <option value="">Select sport</option>
            {sports.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Assigned coach
          <select
            value={form.coachId}
            onChange={(e) => update("coachId", e.target.value)}
            className={fieldClass}
          >
            <option value="">Not assigned</option>
            {availableCoaches.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Phone number
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={fieldClass}
          />
        </label>

        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          Email *
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required={!player}
            disabled={Boolean(player)}
            className={`${fieldClass} disabled:bg-slate-100 disabled:text-slate-500`}
          />
          {player && (
            <span className="mt-1 block text-xs text-slate-500">
              Login email cannot be changed here.
            </span>
          )}
        </label>

        <label className="text-sm font-medium text-slate-700">
          Emergency contact name *
          <input
            value={form.emergencyName}
            onChange={(e) => update("emergencyName", e.target.value)}
            required
            className={fieldClass}
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Emergency contact relationship
          <input
            value={form.emergencyRelationship}
            onChange={(e) => update("emergencyRelationship", e.target.value)}
            placeholder="Parent, Guardian..."
            className={fieldClass}
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Emergency contact phone *
          <input
            type="tel"
            value={form.emergencyPhone}
            onChange={(e) => update("emergencyPhone", e.target.value)}
            required
            className={fieldClass}
          />
        </label>

        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          Address
          <textarea
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            rows={3}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : player ? "Save changes" : "Add player"}
        </button>
      </div>
    </form>
  );
}

export function PlayersManagement() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [sports, setSports] = useState<SportOption[]>([]);
  const [coaches, setCoaches] = useState<CoachOption[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [query, setQuery] = useState("");
  const [sportId, setSportId] = useState("");
  const [coachId, setCoachId] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [modal, setModal] = useState<"add" | "edit" | "view" | null>(null);
  const [selected, setSelected] = useState<Player | null>(null);
  const [statusTarget, setStatusTarget] = useState<Player | null>(null);
  const [toast, setToast] = useState("");
  const [requestError, setRequestError] = useState("");

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  }, []);

  const loadOptions = useCallback(async () => {
    const response = await fetch("/api/players/options", { cache: "no-store" });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(errorMessage(data, "Unable to load sports and coaches."));
    }

    setSports(Array.isArray(data.sports) ? data.sports : []);
    setCoaches(Array.isArray(data.coaches) ? data.coaches : []);
  }, []);

  const loadPlayers = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setRequestError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      if (query.trim()) params.set("search", query.trim());
      if (sportId) params.set("sportId", sportId);
      if (coachId) params.set("coachId", coachId);
      if (status) params.set("status", status);

      const response = await fetch(`/api/players?${params.toString()}`, {
        cache: "no-store",
        signal,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(errorMessage(data, "Unable to load players."));
      }

      setPlayers(Array.isArray(data.players) ? data.players.map(mapPlayer) : []);
      setTotal(Number(data.total ?? 0));
      setTotalPages(Math.max(1, Number(data.totalPages ?? 1)));
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setRequestError(error instanceof Error ? error.message : "Unable to load players.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page, query, sportId, coachId, status]);

  useEffect(() => {
    const controller = new AbortController();
    void loadPlayers(controller.signal);
    return () => controller.abort();
  }, [loadPlayers]);

  useEffect(() => {
    void loadOptions().catch((error) => {
      setRequestError(error instanceof Error ? error.message : "Unable to load options.");
    });
  }, [loadOptions]);

  const activeCount = players.filter((p) => p.status === "ACTIVE").length;
  const inactiveCount = players.filter((p) => p.status !== "ACTIVE").length;

  const sortedPlayers = useMemo(() => {
    const result = [...players];
    if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "player-id") result.sort((a, b) => a.playerCode.localeCompare(b.playerCode));
    return result;
  }, [players, sort]);

  function resetFilters() {
    setQuery("");
    setSportId("");
    setCoachId("");
    setStatus("");
    setPage(1);
    setSort("name");
  }

  async function savePlayer(form: PlayerFormData) {
    const payload = {
      name: form.name.trim(),
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      sportId: form.sportId,
      coachId: form.coachId || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      emergencyContact: {
        name: form.emergencyName.trim(),
        relationship: form.emergencyRelationship.trim(),
        phone: form.emergencyPhone.trim(),
      },
      ...(!selected || modal === "add" ? { email: form.email.trim().toLowerCase() } : {}),
    };

    const isEdit = modal === "edit" && selected;
    const url = isEdit ? `/api/players/${selected.id}` : "/api/players";
    const response = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(errorMessage(data, "Unable to save player."));
    }

    setModal(null);
    setSelected(null);
    setPage(1);
    await loadPlayers();

    if (!isEdit && data.invitationSent === false) {
      notify("Player created, but invitation email could not be sent.");
    } else if (!isEdit) {
      notify("Player created. Password setup invitation sent.");
    } else {
      notify("Player details updated successfully.");
    }
  }

  async function confirmStatusChange() {
    if (!statusTarget) return;

    const nextStatus: Status =
      statusTarget.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    setSavingStatus(true);
    try {
      const response = await fetch(`/api/players/${statusTarget.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(errorMessage(data, "Unable to update player status."));
      }

      setStatusTarget(null);
      await loadPlayers();
      notify(`Player status changed to ${nextStatus.toLowerCase()}.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Status update failed.");
    } finally {
      setSavingStatus(false);
    }
  }

  const selectedSportCoaches = coaches.filter(
    (item) => !item.sportId || item.sportId === selected?.sportId,
  );

  return (
    <DashboardShell
      role="head-coach"
      title="Players Management"
      subtitle="Manage academy players and profiles"
    >
      <PageHeader
        title="Players Management"
        description="Manage player profiles, sports, coaches and account status."
        action={
          <button
            onClick={() => {
              setSelected(null);
              setModal("add");
            }}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Add player
          </button>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total players"
          value={String(total)}
          detail="Players in your academy"
          icon="users"
          tone="blue"
        />
        <StatCard
          label="Active on this page"
          value={String(activeCount)}
          detail="Currently active"
          icon="activity"
          tone="green"
        />
        <StatCard
          label="Inactive / suspended"
          value={String(inactiveCount)}
          detail="On this page"
          icon="users"
          tone="amber"
        />
        <StatCard
          label="Readiness tracking"
          value="—"
          detail="Available after readiness integration"
          icon="trophy"
          tone="violet"
        />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {sports.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setSportId(item.id === sportId ? "" : item.id);
              setPage(1);
            }}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${sportId === item.id
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600"
              }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      <Panel title={`Players (${total})`}>
        <div className="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-12">
          <label className="relative lg:col-span-3">
            <span className="sr-only">Search players</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, email or ID..."
              className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
            />
          </label>

          <select
            aria-label="Filter by sport"
            value={sportId}
            onChange={(e) => {
              setSportId(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm lg:col-span-2"
          >
            <option value="">All sports</option>
            {sports.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>

          <select
            aria-label="Filter by coach"
            value={coachId}
            onChange={(e) => {
              setCoachId(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm lg:col-span-2"
          >
            <option value="">All coaches</option>
            {coaches.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>

          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm lg:col-span-2"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <select
            aria-label="Sort players"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm lg:col-span-2"
          >
            <option value="name">Name A-Z</option>
            <option value="player-id">Player ID</option>
          </select>

          <button
            type="button"
            onClick={resetFilters}
            aria-label="Reset filters"
            className="grid h-10 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 lg:col-span-1"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {requestError && (
          <div role="alert" className="m-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {requestError}
            <button
              onClick={() => void loadPlayers()}
              className="ml-2 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <LoadingState message="Loading players from database..." />
        ) : sortedPlayers.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Player</th>
                    <th className="px-5 py-3">Sport</th>
                    <th className="px-5 py-3">Coach</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Attendance</th>
                    <th className="px-5 py-3">Matches</th>
                    <th className="px-5 py-3">Readiness</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedPlayers.map((player) => (
                    <tr key={player.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                            {player.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900">{player.name}</p>
                            <p className="text-xs text-slate-500">
                              {player.playerCode} · {player.age} yrs · {player.gender}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{player.sport}</td>
                      <td className="px-5 py-4 text-slate-600">{player.coach}</td>
                      <td className="px-5 py-4">
                        <p className="text-slate-700">{player.phone || "—"}</p>
                        <p className="max-w-44 truncate text-xs text-slate-500">{player.email}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-400">—</td>
                      <td className="px-5 py-4 text-slate-400">—</td>
                      <td className="px-5 py-4">
                        <StatusBadge tone="slate">Not available</StatusBadge>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge tone={player.status === "ACTIVE" ? "blue" : "slate"}>
                          {player.status}
                        </StatusBadge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelected(player);
                              setModal("view");
                            }}
                            aria-label={`View ${player.name}`}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelected(player);
                              setModal("edit");
                            }}
                            aria-label={`Edit ${player.name}`}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setStatusTarget(player)}
                            aria-label={`Change status for ${player.name}`}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, total)} of {total}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2">Page {page} of {totalPages}</span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title="No players found"
            description="No database records match the current search or filters."
            action={
              <button
                onClick={resetFilters}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Reset filters
              </button>
            }
          />
        )}
      </Panel>

      {(modal === "add" || modal === "edit") && (
        <Modal
          title={modal === "add" ? "Add new player" : `Edit ${selected?.name ?? "player"}`}
          onClose={() => setModal(null)}
        >
          <PlayerForm
            key={`${modal}-${selected?.id ?? "new"}`}
            player={modal === "edit" ? selected ?? undefined : undefined}
            sports={sports}
            coaches={coaches}
            onCancel={() => setModal(null)}
            onSave={savePlayer}
          />
        </Modal>
      )}

      {modal === "view" && selected && (
        <Modal title="Player profile" onClose={() => setModal(null)}>
          <div className="p-5">
            <div className="flex flex-col gap-4 rounded-xl bg-slate-50 p-5 sm:flex-row sm:items-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-blue-600 text-lg font-bold text-white">
                {selected.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selected.name}</h3>
                <p className="text-sm text-slate-500">
                  {selected.playerCode} · {selected.sport} · {selected.age} years
                </p>
              </div>
              <div className="sm:ml-auto">
                <StatusBadge tone={selected.status === "ACTIVE" ? "blue" : "slate"}>
                  {selected.status}
                </StatusBadge>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Date of birth", displayDate(selected.dateOfBirth)],
                ["Gender", selected.gender],
                ["Phone", selected.phone || "—"],
                ["Email", selected.email || "—"],
                ["Sport", selected.sport],
                ["Coach", selected.coach],
                ["Attendance", "Not available yet"],
                ["Completed matches", "Not available yet"],
                ["Account status", selected.status],
                ["Emergency contact", selected.emergencyContact.name || "—"],
                ["Emergency relationship", selected.emergencyContact.relationship || "—"],
                ["Emergency phone", selected.emergencyContact.phone || "—"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-slate-100 p-3">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</p>
                </div>
              ))}
              <div className="rounded-lg border border-slate-100 p-3 sm:col-span-2">
                <p className="text-xs text-slate-500">Address</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selected.address || "—"}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                Player account
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Password setup and account access are managed through the player invitation flow.
              </p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setModal(null)}
                className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              >
                Close profile
              </button>
            </div>
          </div>
        </Modal>
      )}

      {statusTarget && (
        <Modal title="Change player status" onClose={() => setStatusTarget(null)}>
          <div className="p-5">
            <p className="text-sm text-slate-600">
              Change <strong className="text-slate-900">{statusTarget.name}</strong> from{" "}
              <strong>{statusTarget.status}</strong> to{" "}
              <strong>{statusTarget.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"}</strong>?
            </p>
            <p className="mt-2 text-xs text-slate-500">
              The player's login access will also be updated.
            </p>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setStatusTarget(null)}
                disabled={savingStatus}
                className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => void confirmStatusChange()}
                disabled={savingStatus}
                className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
              >
                {savingStatus ? "Updating..." : "Confirm change"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[60] rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl"
        >
          {toast}
        </div>
      )}
    </DashboardShell>
  );
}
