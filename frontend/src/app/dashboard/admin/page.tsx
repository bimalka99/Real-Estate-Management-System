"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Star, Trash2, ShieldBan, MailOpen } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getAdminStats,
  getAdminUsers,
  updateUserRole,
  banUser,
  getProperties,
  setPropertyFeatured,
  deleteProperty as apiDeleteProperty,
  getContactMessages,
  markContactMessageRead,
} from "@/lib/api";
import type { AdminStatsDto, AdminUserDto, ContactMessageDto, PropertyDto, UserRole } from "@/lib/types";
import { formatPrice } from "@/lib/format";

const ROLES: UserRole[] = ["Client", "Agent", "AgencyAdmin", "SuperAdmin"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminDashboardPage() {
  const { user, accessToken, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<AdminStatsDto | null>(null);
  const [users, setUsers] = useState<AdminUserDto[] | null>(null);
  const [properties, setProperties] = useState<PropertyDto[] | null>(null);
  const [messages, setMessages] = useState<ContactMessageDto[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = user?.role === "SuperAdmin";

  useEffect(() => {
    if (!accessToken || !isSuperAdmin) return;

    getAdminStats(accessToken).then(setStats).catch(() => setStats(null));
    getAdminUsers(accessToken).then(setUsers).catch(() => setUsers([]));
    getProperties({ pageSize: 50 })
      .then((res) => setProperties(res.items))
      .catch(() => setProperties([]));
    getContactMessages(accessToken).then(setMessages).catch(() => setMessages([]));
  }, [accessToken, isSuperAdmin]);

  async function handleMarkRead(id: string) {
    if (!accessToken) return;
    setBusyId(id);
    try {
      await markContactMessageRead(accessToken, id);
      setMessages((prev) => prev?.map((m) => (m.id === id ? { ...m, isRead: true } : m)) ?? null);
    } catch {
      setError("Couldn't update that message.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleRoleChange(userId: string, role: UserRole) {
    if (!accessToken) return;
    setBusyId(userId);
    setError(null);
    try {
      await updateUserRole(accessToken, userId, role);
      setUsers((prev) => prev?.map((u) => (u.id === userId ? { ...u, role } : u)) ?? null);
    } catch {
      setError("Couldn't update that user's role (you can't change your own).");
    } finally {
      setBusyId(null);
    }
  }

  async function handleBan(userId: string) {
    if (!accessToken) return;
    if (!window.confirm("Ban this user? This can't be undone here.")) return;
    setBusyId(userId);
    setError(null);
    try {
      await banUser(accessToken, userId);
      setUsers((prev) => prev?.filter((u) => u.id !== userId) ?? null);
    } catch {
      setError("Couldn't ban that user (you can't ban yourself).");
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleFeatured(propertyId: string, current: boolean) {
    if (!accessToken) return;
    setBusyId(propertyId);
    try {
      await setPropertyFeatured(accessToken, propertyId, !current);
      setProperties((prev) => prev?.map((p) => (p.id === propertyId ? { ...p, isFeatured: !current } : p)) ?? null);
    } catch {
      setError("Couldn't update that listing.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteProperty(propertyId: string) {
    if (!accessToken) return;
    if (!window.confirm("Remove this listing from the site?")) return;
    setBusyId(propertyId);
    try {
      await apiDeleteProperty(accessToken, propertyId);
      setProperties((prev) => prev?.filter((p) => p.id !== propertyId) ?? null);
    } catch {
      setError("Couldn't remove that listing.");
    } finally {
      setBusyId(null);
    }
  }

  if (authLoading) {
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
          <Link href="/login" className="text-accent underline-offset-4 hover:underline">Sign in</Link> with an admin account.
        </p>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-sm text-muted">This area is for platform administrators only.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <p className="text-xs uppercase tracking-[0.3em] text-accent">Platform Administration</p>
      <h1 className="font-display mt-3 text-4xl text-foreground">Admin Dashboard</h1>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {/* Stats */}
      <section className="mt-10">
        {!stats ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-muted" size={20} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["Users", stats.totalUsers],
              ["Agents", stats.totalAgents],
              ["Clients", stats.totalClients],
              ["Properties", stats.totalProperties],
              ["Agencies", stats.totalAgencies],
              ["Inquiries", stats.totalInquiries],
              ["Reviews", stats.totalReviews],
            ].map(([label, value]) => (
              <div key={label} className="border border-border bg-surface p-5 text-center">
                <p className="font-display text-3xl text-accent">{value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.15em] text-muted">{label}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Users */}
      <section className="mt-16">
        <h2 className="font-display text-2xl text-foreground">Users</h2>

        {users === null ? (
          <div className="mt-8 flex justify-center">
            <Loader2 className="animate-spin text-muted" size={20} />
          </div>
        ) : (
          <div className="mt-6 divide-y divide-border border border-border">
            {users.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{u.firstName} {u.lastName}</p>
                  <p className="mt-0.5 text-xs text-muted">{u.email} &middot; Joined {formatDate(u.createdAtUtc)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={u.role}
                    disabled={busyId === u.id || u.id === user.id}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                    className="border border-border bg-surface px-2 py-1.5 text-xs focus:border-accent focus:outline-none disabled:opacity-50"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleBan(u.id)}
                    disabled={busyId === u.id || u.id === user.id}
                    aria-label="Ban user"
                    className="text-muted transition-colors hover:text-red-600 disabled:opacity-30"
                  >
                    <ShieldBan size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contact messages */}
      <section className="mt-16">
        <h2 className="font-display text-2xl text-foreground">
          Contact Messages
          {messages && messages.some((m) => !m.isRead) && (
            <span className="ml-2 align-middle text-xs font-sans text-accent">
              {messages.filter((m) => !m.isRead).length} unread
            </span>
          )}
        </h2>

        {messages === null ? (
          <div className="mt-8 flex justify-center">
            <Loader2 className="animate-spin text-muted" size={20} />
          </div>
        ) : messages.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No messages yet.</p>
        ) : (
          <div className="mt-6 divide-y divide-border border border-border">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-wrap items-start justify-between gap-3 p-4 ${m.isRead ? "" : "bg-accent/5"}`}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">
                    {m.name} <span className="text-muted">&middot; {m.email}</span>
                  </p>
                  <p className="mt-1 text-sm text-foreground/80">{m.message}</p>
                  <p className="mt-1.5 text-xs text-muted">{formatDate(m.createdAtUtc)}</p>
                </div>
                {!m.isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(m.id)}
                    disabled={busyId === m.id}
                    aria-label="Mark as read"
                    className="flex shrink-0 items-center gap-1.5 text-xs uppercase tracking-wide text-muted transition-colors hover:text-accent disabled:opacity-50"
                  >
                    <MailOpen size={14} /> Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Listings moderation */}
      <section className="mt-16">
        <h2 className="font-display text-2xl text-foreground">Listings</h2>

        {properties === null ? (
          <div className="mt-8 flex justify-center">
            <Loader2 className="animate-spin text-muted" size={20} />
          </div>
        ) : (
          <div className="mt-6 divide-y divide-border border border-border">
            {properties.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <Link href={`/properties/${p.id}`} className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{p.title}</p>
                  <p className="mt-0.5 text-xs text-muted">{p.city} &middot; {p.agentName}</p>
                </Link>
                <div className="flex items-center gap-4">
                  <span className="font-display text-sm text-foreground">{formatPrice(p.price, p.currency)}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(p.id, p.isFeatured)}
                    disabled={busyId === p.id}
                    aria-label="Toggle featured"
                    className="disabled:opacity-50"
                  >
                    <Star size={16} className={p.isFeatured ? "fill-accent text-accent" : "text-muted hover:text-accent"} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProperty(p.id)}
                    disabled={busyId === p.id}
                    aria-label="Remove listing"
                    className="text-muted transition-colors hover:text-red-600 disabled:opacity-30"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
