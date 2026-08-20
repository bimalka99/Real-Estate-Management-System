"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Mail, Phone, Pencil, Building2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getProperties, getMyInquiries } from "@/lib/api";
import type { PropertyDto, InquiryDto } from "@/lib/types";
import { formatPrice, propertyStatusLabels } from "@/lib/format";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function DashboardPage() {
  const { user, accessToken, isLoading: authLoading } = useAuth();
  const [listings, setListings] = useState<PropertyDto[] | null>(null);
  const [leads, setLeads] = useState<InquiryDto[] | null>(null);

  const canManageListings = user && ["Agent", "AgencyAdmin", "SuperAdmin"].includes(user.role);

  useEffect(() => {
    if (!accessToken || !user || !canManageListings) return;

    getProperties({ agentId: user.id, pageSize: 50 })
      .then((res) => setListings(res.items))
      .catch(() => setListings([]));

    getMyInquiries(accessToken)
      .then(setLeads)
      .catch(() => setLeads([]));
  }, [accessToken, user, canManageListings]);

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
          <Link href="/login" className="text-accent underline-offset-4 hover:underline">
            Sign in
          </Link>{" "}
          with an agent account to access your dashboard.
        </p>
      </div>
    );
  }

  if (!canManageListings) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-sm text-muted">
          The dashboard is available to Agent accounts. You&apos;re signed in as a Client.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Agent Dashboard</p>
          <h1 className="font-display mt-3 text-4xl text-foreground">Welcome, {user.firstName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/agency"
            className="flex items-center gap-2 border border-border px-6 py-3 text-sm uppercase tracking-wide text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            <Building2 size={16} /> My Agency
          </Link>
          <Link
            href="/dashboard/new"
            className="flex items-center gap-2 bg-accent px-6 py-3 text-sm uppercase tracking-wide text-accent-foreground transition-colors hover:bg-accent-dark"
          >
            <Plus size={16} /> New Listing
          </Link>
        </div>
      </div>

      {/* My Listings */}
      <section className="mt-14">
        <h2 className="font-display text-2xl text-foreground">My Listings</h2>

        {listings === null ? (
          <div className="mt-8 flex justify-center">
            <Loader2 className="animate-spin text-muted" size={20} />
          </div>
        ) : listings.length === 0 ? (
          <div className="mt-6 border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted">You haven&apos;t created any listings yet.</p>
          </div>
        ) : (
          <div className="mt-6 divide-y divide-border border border-border">
            {listings.map((property) => (
              <div
                key={property.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-surface-muted"
              >
                <Link href={`/properties/${property.id}`} className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{property.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {property.city} &middot; Listed {formatDate(property.createdAtUtc)}
                  </p>
                </Link>
                <div className="flex items-center gap-4">
                  <span className="text-xs uppercase tracking-[0.15em] text-muted">
                    {propertyStatusLabels[property.status] ?? property.status}
                  </span>
                  <span className="font-display text-lg text-foreground">
                    {formatPrice(property.price, property.currency)}
                  </span>
                  <Link
                    href={`/dashboard/edit/${property.id}`}
                    aria-label="Edit listing"
                    className="text-muted transition-colors hover:text-accent"
                  >
                    <Pencil size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Leads */}
      <section className="mt-16">
        <h2 className="font-display text-2xl text-foreground">Leads</h2>

        {leads === null ? (
          <div className="mt-8 flex justify-center">
            <Loader2 className="animate-spin text-muted" size={20} />
          </div>
        ) : leads.length === 0 ? (
          <div className="mt-6 border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted">No inquiries on your listings yet.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {leads.map((lead) => (
              <div key={lead.id} className="border border-border bg-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm text-foreground">{lead.name}</p>
                    <p className="text-xs text-muted">
                      Re: <span className="text-foreground/80">{lead.propertyTitle}</span>
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.15em] text-accent">{lead.status}</span>
                </div>

                <p className="mt-3 text-sm text-foreground/80">{lead.message}</p>

                <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
                  <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 hover:text-accent">
                    <Mail size={13} /> {lead.email}
                  </a>
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 hover:text-accent">
                      <Phone size={13} /> {lead.phone}
                    </a>
                  )}
                  <span>{formatDate(lead.createdAtUtc)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
