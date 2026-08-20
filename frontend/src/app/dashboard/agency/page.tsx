"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, Save, LogOut, Building2, Check, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getAgencyById,
  createAgency,
  updateAgency,
  leaveAgency,
  getJoinRequestsForAgency,
  approveJoinRequest,
  rejectJoinRequest,
  ApiError,
} from "@/lib/api";
import type { AgencyDetailDto, AgencyJoinRequestDto } from "@/lib/types";

export default function DashboardAgencyPage() {
  const { user, accessToken, isLoading: authLoading, refreshSession } = useAuth();
  const [agency, setAgency] = useState<AgencyDetailDto | null | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinRequests, setJoinRequests] = useState<AgencyJoinRequestDto[] | null>(null);
  const [busyRequestId, setBusyRequestId] = useState<string | null>(null);

  const canManage = user && ["Agent", "AgencyAdmin", "SuperAdmin"].includes(user.role);
  const isAdmin = user?.role === "AgencyAdmin" || user?.role === "SuperAdmin";

  useEffect(() => {
    if (!user?.agencyId) {
      setAgency(null);
      return;
    }
    getAgencyById(user.agencyId).then(setAgency);
  }, [user?.agencyId]);

  useEffect(() => {
    if (!accessToken || !isAdmin || !agency) {
      setJoinRequests(null);
      return;
    }
    getJoinRequestsForAgency(accessToken, agency.id).then(setJoinRequests).catch(() => setJoinRequests([]));
  }, [accessToken, isAdmin, agency?.id]);

  async function handleApprove(requestId: string) {
    if (!accessToken) return;
    setBusyRequestId(requestId);
    try {
      await approveJoinRequest(accessToken, requestId);
      setJoinRequests((prev) => prev?.filter((r) => r.id !== requestId) ?? null);
      setAgency(agency ? await getAgencyById(agency.id) : agency);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't approve that request.");
    } finally {
      setBusyRequestId(null);
    }
  }

  async function handleReject(requestId: string) {
    if (!accessToken) return;
    setBusyRequestId(requestId);
    try {
      await rejectJoinRequest(accessToken, requestId);
      setJoinRequests((prev) => prev?.filter((r) => r.id !== requestId) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't reject that request.");
    } finally {
      setBusyRequestId(null);
    }
  }

  async function handleCreateOrUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;

    setIsSubmitting(true);
    setError(null);

    const data = new FormData(event.currentTarget);
    const input = {
      name: String(data.get("name")),
      description: String(data.get("description") ?? "") || undefined,
      website: String(data.get("website") ?? "") || undefined,
      phoneNumber: String(data.get("phoneNumber") ?? "") || undefined,
      email: String(data.get("email") ?? "") || undefined,
    };

    try {
      if (agency) {
        await updateAgency(accessToken, agency.id, input);
        setAgency(await getAgencyById(agency.id));
      } else {
        const newId = await createAgency(accessToken, input);
        await refreshSession(); // pick up the new AgencyAdmin role claim
        setAgency(await getAgencyById(newId));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLeave() {
    if (!accessToken) return;
    if (!window.confirm("Leave this agency?")) return;

    setIsLeaving(true);
    try {
      await leaveAgency(accessToken);
      await refreshSession(); // AgencyAdmin -> Agent demotion, if applicable
      setAgency(null);
    } catch {
      setError("Couldn't leave the agency. Please try again.");
    } finally {
      setIsLeaving(false);
    }
  }

  if (authLoading || agency === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-muted" size={24} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-sm text-muted">
          <Link href="/login" className="text-accent underline-offset-4 hover:underline">Sign in</Link> with an agent account to manage an agency.
        </p>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-sm text-muted">Agency management is available to Agent accounts.</p>
      </div>
    );
  }

  // Member (not admin) of an existing agency — read-only view + leave option.
  if (agency && !isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 lg:px-10">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Agent Dashboard</p>
        <h1 className="font-display mt-3 text-4xl text-foreground">My Agency</h1>

        <div className="mt-10 border border-border bg-surface p-8">
          <div className="flex items-center gap-3">
            <Building2 className="text-accent" size={24} />
            <h2 className="font-display text-2xl text-foreground">{agency.name}</h2>
          </div>
          {agency.description && <p className="mt-3 text-sm text-muted">{agency.description}</p>}
          <p className="mt-4 text-xs text-muted">
            {agency.agentCount} agents &middot; {agency.listingCount} listings
          </p>
          <Link href={`/agencies/${agency.id}`} className="mt-4 inline-block text-sm text-accent underline-offset-4 hover:underline">
            View public profile
          </Link>
        </div>

        <button
          type="button"
          onClick={handleLeave}
          disabled={isLeaving}
          className="mt-6 flex items-center gap-2 border border-red-200 px-6 py-3 text-sm uppercase tracking-wide text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
        >
          {isLeaving ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
          {isLeaving ? "Leaving..." : "Leave Agency"}
        </button>
        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  // AgencyAdmin — editable form, or no agency yet — creation form. Same form, different verb.
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 lg:px-10">
      <p className="text-xs uppercase tracking-[0.3em] text-accent">Agent Dashboard</p>
      <h1 className="font-display mt-3 text-4xl text-foreground">
        {agency ? "Manage Agency" : "Create an Agency"}
      </h1>
      {!agency && (
        <p className="mt-3 text-sm text-muted">
          Start your own agency and become its admin, or{" "}
          <Link href="/agencies" className="text-accent underline-offset-4 hover:underline">
            browse existing agencies
          </Link>{" "}
          to join one instead.
        </p>
      )}

      {agency && (
        <section className="mt-10 border border-border p-6">
          <h2 className="text-sm font-medium text-foreground">Pending Join Requests</h2>

          {joinRequests === null ? (
            <div className="mt-4 flex justify-center">
              <Loader2 className="animate-spin text-muted" size={18} />
            </div>
          ) : joinRequests.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No pending requests right now.</p>
          ) : (
            <div className="mt-4 divide-y divide-border">
              {joinRequests.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">{r.userName}</p>
                    <p className="mt-0.5 text-xs text-muted">{r.userEmail}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleApprove(r.id)}
                      disabled={busyRequestId === r.id}
                      aria-label="Approve"
                      className="flex items-center gap-1.5 border border-accent px-3 py-1.5 text-xs uppercase tracking-wide text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                    >
                      <Check size={13} /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(r.id)}
                      disabled={busyRequestId === r.id}
                      aria-label="Reject"
                      className="flex items-center gap-1.5 border border-red-200 px-3 py-1.5 text-xs uppercase tracking-wide text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                      <X size={13} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <form onSubmit={handleCreateOrUpdate} className="mt-10 space-y-5">
        <div>
          <label className="mb-1.5 block text-xs text-muted">Agency name</label>
          <input name="name" required maxLength={200} defaultValue={agency?.name} className="w-full border border-border bg-surface px-4 py-3 text-sm focus:border-accent focus:outline-none" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-muted">Description</label>
          <textarea name="description" rows={3} defaultValue={agency?.description ?? ""} className="w-full border border-border bg-surface px-4 py-3 text-sm focus:border-accent focus:outline-none" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs text-muted">Email</label>
            <input name="email" type="email" defaultValue={agency?.email ?? ""} className="w-full border border-border bg-surface px-4 py-3 text-sm focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">Phone</label>
            <input name="phoneNumber" defaultValue={agency?.phoneNumber ?? ""} className="w-full border border-border bg-surface px-4 py-3 text-sm focus:border-accent focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-muted">Website</label>
          <input name="website" defaultValue={agency?.website ?? ""} className="w-full border border-border bg-surface px-4 py-3 text-sm focus:border-accent focus:outline-none" />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 bg-accent px-8 py-3 text-sm uppercase tracking-wide text-accent-foreground transition-colors hover:bg-accent-dark disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSubmitting ? "Saving..." : agency ? "Save Changes" : "Create Agency"}
        </button>
      </form>

      {agency && (
        <button
          type="button"
          onClick={handleLeave}
          disabled={isLeaving}
          className="mt-6 flex items-center gap-2 border border-red-200 px-6 py-3 text-sm uppercase tracking-wide text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
        >
          {isLeaving ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
          {isLeaving ? "Leaving..." : "Leave Agency"}
        </button>
      )}
    </div>
  );
}
