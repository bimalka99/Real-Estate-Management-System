"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Save } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createProperty, ApiError } from "@/lib/api";
import type { ListingType, PropertyType } from "@/lib/types";
import LocationPicker from "@/components/map/LocationPicker";

export default function NewListingPage() {
  const { user, accessToken, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canManageListings = user && ["Agent", "AgencyAdmin", "SuperAdmin"].includes(user.role);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;

    setIsSubmitting(true);
    setError(null);

    const data = new FormData(event.currentTarget);
    const amenitiesRaw = String(data.get("amenities") ?? "");

    try {
      const id = await createProperty(accessToken, {
        title: String(data.get("title")),
        description: String(data.get("description")),
        type: String(data.get("type")) as PropertyType,
        listingType: String(data.get("listingType")) as ListingType,
        price: Number(data.get("price")),
        currency: "USD",
        addressLine: String(data.get("addressLine")),
        city: String(data.get("city")),
        state: String(data.get("state") ?? "") || undefined,
        country: String(data.get("country")),
        postalCode: String(data.get("postalCode") ?? "") || undefined,
        latitude: data.get("latitude") ? Number(data.get("latitude")) : undefined,
        longitude: data.get("longitude") ? Number(data.get("longitude")) : undefined,
        bedrooms: Number(data.get("bedrooms")),
        bathrooms: Number(data.get("bathrooms")),
        areaSqft: Number(data.get("areaSqft")),
        yearBuilt: data.get("yearBuilt") ? Number(data.get("yearBuilt")) : undefined,
        amenities: amenitiesRaw
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
      });
      // Straight to the edit page rather than the public listing — that's where
      // photos get added, and a brand-new listing has none yet.
      router.push(`/dashboard/edit/${id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        const firstFieldError = err.errors ? Object.values(err.errors)[0]?.[0] : undefined;
        setError(firstFieldError ?? err.message);
      } else {
        setError("Something went wrong creating the listing. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-muted" size={24} />
      </div>
    );
  }

  if (!user || !canManageListings) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-sm text-muted">
          {!user ? (
            <>
              <Link href="/login" className="text-accent underline-offset-4 hover:underline">
                Sign in
              </Link>{" "}
              with an agent account to create a listing.
            </>
          ) : (
            "Only Agent accounts can create listings."
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10">
      <p className="text-xs uppercase tracking-[0.3em] text-accent">Agent Dashboard</p>
      <h1 className="font-display mt-3 text-4xl text-foreground">Create New Listing</h1>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div>
          <label className="mb-1.5 block text-xs text-muted">Title</label>
          <input
            name="title"
            required
            maxLength={200}
            placeholder="e.g. Cliffside Villa"
            className="w-full border border-border bg-surface px-4 py-3 text-sm focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-muted">Description</label>
          <textarea
            name="description"
            required
            rows={4}
            className="w-full border border-border bg-surface px-4 py-3 text-sm focus:border-accent focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs text-muted">Type</label>
            <select name="type" defaultValue="Villa" className="w-full border border-border bg-surface px-3 py-3 text-sm focus:border-accent focus:outline-none">
              <option value="Villa">Villa</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Apartment">Apartment</option>
              <option value="Estate">Estate</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Land">Land</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">Listing</label>
            <select name="listingType" defaultValue="Sale" className="w-full border border-border bg-surface px-3 py-3 text-sm focus:border-accent focus:outline-none">
              <option value="Sale">For Sale</option>
              <option value="Rent">For Rent</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">Price (USD)</label>
            <input name="price" type="number" required min={1} className="w-full border border-border bg-surface px-3 py-3 text-sm focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">Year Built</label>
            <input name="yearBuilt" type="number" className="w-full border border-border bg-surface px-3 py-3 text-sm focus:border-accent focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-muted">Address</label>
          <input
            name="addressLine"
            required
            className="w-full border border-border bg-surface px-4 py-3 text-sm focus:border-accent focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs text-muted">City</label>
            <input name="city" required className="w-full border border-border bg-surface px-3 py-3 text-sm focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">State</label>
            <input name="state" className="w-full border border-border bg-surface px-3 py-3 text-sm focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">Country</label>
            <input name="country" required className="w-full border border-border bg-surface px-3 py-3 text-sm focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">Postal Code</label>
            <input name="postalCode" className="w-full border border-border bg-surface px-3 py-3 text-sm focus:border-accent focus:outline-none" />
          </div>
        </div>

        <LocationPicker />

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-muted">Bedrooms</label>
            <input name="bedrooms" type="number" required min={0} className="w-full border border-border bg-surface px-3 py-3 text-sm focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">Bathrooms</label>
            <input name="bathrooms" type="number" required min={0} className="w-full border border-border bg-surface px-3 py-3 text-sm focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">Area (sqft)</label>
            <input name="areaSqft" type="number" required min={1} className="w-full border border-border bg-surface px-3 py-3 text-sm focus:border-accent focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-muted">Amenities (comma-separated)</label>
          <input
            name="amenities"
            placeholder="Pool, Ocean View, Wine Cellar"
            className="w-full border border-border bg-surface px-4 py-3 text-sm focus:border-accent focus:outline-none"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 bg-accent px-8 py-3 text-sm uppercase tracking-wide text-accent-foreground transition-colors hover:bg-accent-dark disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSubmitting ? "Creating..." : "Create Listing"}
        </button>
      </form>
    </div>
  );
}
