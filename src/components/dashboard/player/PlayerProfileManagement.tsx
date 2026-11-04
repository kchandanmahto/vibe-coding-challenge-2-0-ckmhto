"use client";

import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";
import { Camera, Pencil, RotateCcw, Save, Upload, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { LoadingState, PageHeader } from "../DashboardUI";
import { Panel, StatusBadge } from "../Dashboard";
import { isPlayerReady } from "../coach/coachPlayersData";
import { currentPlayerProfile, playerProfileDetails } from "./playerProfileData";

const fieldClass = "mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const disabledFieldClass = `${fieldClass} bg-slate-50 text-slate-500`;

export function PlayerProfileManagement() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: currentPlayerProfile.name,
    email: currentPlayerProfile.email,
    phone: currentPlayerProfile.phone,
    address: currentPlayerProfile.address,
    emergencyContact: playerProfileDetails.emergencyContact,
  });
  const [savedForm, setSavedForm] = useState(form);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [savedPhoto, setSavedPhoto] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const previewUrl = useRef<string | null>(null);
  const ready = isPlayerReady(currentPlayerProfile);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => () => {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
  }, []);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("The profile photo must be 5 MB or smaller.");
      return;
    }
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = URL.createObjectURL(file);
    setPhotoPreview(previewUrl.current);
    setError("");
  };

  const validate = () => {
    if (!form.name.trim()) return "Full name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Enter a valid email address.";
    if (!form.phone.trim()) return "Phone number is required.";
    if (!form.address.trim()) return "Address is required.";
    if (!form.emergencyContact.trim()) return "Emergency contact is required.";
    return "";
  };

  const requestSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setConfirmSave(true);
  };

  const saveChanges = () => {
    setSavedForm(form);
    setSavedPhoto(photoPreview);
    setConfirmSave(false);
    setEditing(false);
    notify("Profile preview changes saved locally.");
  };

  const cancelChanges = () => {
    setForm(savedForm);
    setPhotoPreview(savedPhoto);
    setEditing(false);
    setError("");
    notify("Unsaved profile changes were discarded.");
  };

  const resetChanges = () => {
    setForm(savedForm);
    setPhotoPreview(savedPhoto);
    setConfirmReset(false);
    notify("Profile form reset to its last preview state.");
  };

  const displayedPhoto = photoPreview ?? savedPhoto;

  return (
    <DashboardShell role="player" title="My profile" subtitle="Your personal and academy information">
      <PageHeader title="Player Profile" description="View and update your permitted personal details" />
      {toast && <div role="status" className="fixed bottom-5 right-5 z-[60] rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">{toast}</div>}
      {loading ? <LoadingState message="Loading your profile..." /> : (
        <div className="space-y-5">
          {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
            <Panel title="Profile overview">
              <div className="p-5 text-center">
                {displayedPhoto ? (
                  <img src={displayedPhoto} alt={`${savedForm.name} profile preview`} className="mx-auto h-28 w-28 rounded-full object-cover" />
                ) : (
                  <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-blue-100 text-3xl font-bold text-blue-700">{currentPlayerProfile.initials}</div>
                )}
                <h2 className="mt-4 text-xl font-bold text-slate-900">{savedForm.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{currentPlayerProfile.sport} · {currentPlayerProfile.age} years</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <StatusBadge tone={ready ? "green" : "amber"}>{ready ? "Ready" : "Not ready"}</StatusBadge>
                  <StatusBadge tone={currentPlayerProfile.status === "Active" ? "blue" : "slate"}>{currentPlayerProfile.status}</StatusBadge>
                </div>
                <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <Camera className="h-4 w-4" />
                  {displayedPhoto ? "Change photo" : "Upload photo"}
                  <input type="file" accept="image/*" onChange={handlePhoto} disabled={!editing} className="sr-only" />
                </label>
                <p className="mt-2 text-xs text-slate-400">Local preview only · Max 5 MB</p>
                {!editing && <p className="mt-2 text-xs text-slate-500">Choose Edit Profile to change the photo.</p>}
              </div>
            </Panel>

            <Panel title="Profile details" action={!editing ? (
              <button type="button" onClick={() => setEditing(true)} className="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white"><Pencil className="h-4 w-4" />Edit profile</button>
            ) : (
              <button type="button" onClick={() => setConfirmReset(true)} className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700"><RotateCcw className="h-4 w-4" />Reset</button>
            )}>
              <form onSubmit={requestSave} className="grid gap-4 p-5 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">Full name<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} disabled={!editing} className={editing ? fieldClass : disabledFieldClass} /></label>
                <label className="text-sm font-medium text-slate-700">Player ID<input value={currentPlayerProfile.id} disabled className={disabledFieldClass} /></label>
                <label className="text-sm font-medium text-slate-700">Date of birth<input value={playerProfileDetails.dateOfBirth} disabled className={disabledFieldClass} /></label>
                <label className="text-sm font-medium text-slate-700">Age<input value={String(currentPlayerProfile.age)} disabled className={disabledFieldClass} /></label>
                <label className="text-sm font-medium text-slate-700">Gender<input value={currentPlayerProfile.gender} disabled className={disabledFieldClass} /></label>
                <label className="text-sm font-medium text-slate-700">Email address<input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} disabled={!editing} className={editing ? fieldClass : disabledFieldClass} /></label>
                <label className="text-sm font-medium text-slate-700">Phone number<input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} disabled={!editing} className={editing ? fieldClass : disabledFieldClass} /></label>
                <label className="text-sm font-medium text-slate-700 md:col-span-2">Address<textarea value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} disabled={!editing} rows={3} className={`${editing ? fieldClass : disabledFieldClass} h-auto py-3`} /></label>
                <label className="text-sm font-medium text-slate-700 md:col-span-2">Emergency contact<input value={form.emergencyContact} onChange={(event) => setForm((current) => ({ ...current, emergencyContact: event.target.value }))} disabled={!editing} className={editing ? fieldClass : disabledFieldClass} /></label>
                {editing && (
                  <div className="flex flex-col-reverse gap-2 md:col-span-2 sm:flex-row sm:justify-end">
                    <button type="button" onClick={cancelChanges} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Cancel</button>
                    <button type="submit" className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"><Save className="h-4 w-4" />Save changes</button>
                  </div>
                )}
              </form>
            </Panel>
          </div>

          <Panel title="Sports information">
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
              {[["Primary sport", currentPlayerProfile.sport], ["Assigned coach", playerProfileDetails.assignedCoach], ["Academy", playerProfileDetails.academyName], ["Joining date", playerProfileDetails.joiningDate], ["Player status", currentPlayerProfile.status]].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-800">{value}</p></div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {confirmSave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4" role="presentation">
          <div role="alertdialog" aria-modal="true" aria-labelledby="save-profile-title" className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4"><div><h2 id="save-profile-title" className="text-lg font-semibold text-slate-900">Save profile preview?</h2><p className="mt-2 text-sm text-slate-500">These changes remain in local component state only.</p></div><button type="button" onClick={() => setConfirmSave(false)} aria-label="Close" className="text-slate-400"><X className="h-5 w-5" /></button></div>
            <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setConfirmSave(false)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Cancel</button><button type="button" onClick={saveChanges} className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"><Upload className="h-4 w-4" />Confirm</button></div>
          </div>
        </div>
      )}

      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4" role="presentation">
          <div role="alertdialog" aria-modal="true" aria-labelledby="reset-profile-title" className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
            <h2 id="reset-profile-title" className="text-lg font-semibold text-slate-900">Reset unsaved changes?</h2><p className="mt-2 text-sm text-slate-500">The editable fields will return to the last preview state.</p>
            <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setConfirmReset(false)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Cancel</button><button type="button" onClick={resetChanges} className="h-10 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white">Reset changes</button></div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
