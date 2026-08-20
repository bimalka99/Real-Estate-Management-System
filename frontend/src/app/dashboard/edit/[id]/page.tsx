"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Save, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getPropertyById, updateProperty, deleteProperty, ApiError } from "@/lib/api";
import type { ListingType, PropertyDto, PropertyStatus, PropertyType } from "@/lib/types";
import ImageManager from "@/components/property/ImageManager";
import LocationPicker from "@/components/map/LocationPicker";

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { user, accessToken, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [property, setProperty] = useState<PropertyDto | null | undefined>(undefined); // undefined = loading, null = not found
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPropertyById(id).then(setProperty);
  }, [id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;

    setIsSubmitting(true);
    setError(null);

    const data = new FormData(event.currentTarget);
    const amenitiesRaw = String(data.get("amenities") ?? "");

    try {
      await updateProperty(accessToken, id, {
        title: String(data.get("title")),
        description: String(data.get("description")),
        type: String(data.get("type")) as PropertyType,
        listingType: String(data.get("listingType")) as ListingType,
        status: String(data.get("status")) as PropertyStatus,
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
        amenities: amenitiesRaw.split(",").map((a) => a.trim()).filter(Boolean),
        isFeatured: data.get("isFeatured") === "on",
      });
      router.push(`/properties/${id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        const firstFieldError = err.errors ? Object.values(err.errors)[0]?.[0] : undefined;
        setError(firstFieldError ?? err.message);
      } else {
        setError("Something went wrong updating the listing. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!accessToken) return;
    if (!window.confirm("Delete this listing? This can't be undone from the site.")) return;

    setIsDeleting(true);
    try {
      await deleteProperty(accessToken, id);
      router.push("/dashboard");
    } catch {
      setError("Couldn't delete the listing. Please try again.");
      setIsDeleting(false);
    }
  }

  if (authLoading || property === undefined) {
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
          <Link href="/login" className="text-accent underline-offset-4 hover:underline">Sign in</Link> to edit this listing.
        </p>
      </div>
    );
  }

  if (property === null) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-sm text-muted">This listing doesn&apos;t exist or has been removed.</p>
      </div>
    );
  }

  if (property.agentId !== user.id) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-sm text-muted">You can only edit your own listings.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10">
      <p className="text-xs uppercase tracking-[0.3em] text-accent">Agent Dashboard</p>
      <h1 className="font-display mt-3 text-4xl text-foreground">Edit Listing</h1>

      <div className="mt-10">
        <ImageManager propertyId={id} initialImages={property.images} />
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6 border-t border-border pt-10">
        <div>
          <label className="mb-1.5 block text-xs text-muted">Title</label>
          <input name="title" required maxLength={200} defaultValue={property.title} className="w-full border border-border bg-surface px-4 py-3 text-sm focus:border-accent focus:outline-none" />
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-muted">Description</label>
          <textarea name="description" required rows={4} defaultValue={property.description} className="w-full border border-border bg-surface px-4 py-3 text-sm focus:border-accent focus:outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div>
            <label className="mb-1.5 block text-xs text-muted">Type</label>
            <select name="type" defaultValue={property.type} className="w-full border border-border bg-surface px-3 py-3 text-sm focus:border-accent focus:outline-none">
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
            <select name="listingType" defaultValue={property.listingType} className="w-full border border-border bg-surface px-3 py-3 text-sm focus:border-accent focus:outline-none">
              <option value="Sale">For Sale</option>
              <option value="Rent">For Rent</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">Status</label>
            <select name="status" defaultValue={property.status} className="w-full border border-border bg-surface px-3 py-3 text-sm focus:border-accent focus:outline-none">
              <option value="ForSale">For Sale</option>
              <option value="ForRent">For Rent</option>
              <option value="UnderOffer">Under Offer</option>
              <option value="Sold">Sold</option>
              <option value="OffMarket">Off-Market</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">Price (USD)</label>
            <input name="price" type="number" required min={1} defaultValue={property.price} className="w-full border border-border bg-surface px-3 py-3 text-sm focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">Year Built</label>
            <input name="yearBuilt" type="number" defaultValue={property.yearBuilt ?? ""} className="w-full border border-border bg-surface px-3 py-3 text-sm focus:border-accent focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-muted">Address</label>
          <input name="addressLine" required defaultValue={property.addressLine} className="w-full border border-border bg-surface px-4 py-3 text-sm focus:border-accent focus:outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs text-muted">City</label>
            <input name="city" required defaultValue={property.city} className="w-full border border-border bg-surface px-3 py-3 text-sm focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">State</label>
            <input name="state" defaultValue={property.state ?? ""} className="w-full border border-border bg-surface px-3 py-3 text-sm focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">Country</label>
            <input name="country" required defaultValue={property.country} className="w-full border border-border bg-surface px-3 py-3 text-sm focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">Postal Code</label>
            <input name="postalCode" defaultValue={property.postalCode ?? ""} className="w-full border border-border bg-surface px-3 py-3 text-sm focus:border-accent focus:outline-none" />
          </div>
        </div>

        <LocationPicker initialLatitude={property.latitude} initialLongitude={property.longitude} />

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-muted">Bedrooms</label>
            <input name="bedrooms" type="number" required min={0} defaultValue={property.bedrooms} className="w-full border border-border bg-surface px-3 py-3 text-sm focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">Bathrooms</label>
            <input name="bathrooms" type="number" required min={0} defaultValue={property.bathrooms} className="w-full border border-border bg-surface px-3 py-3 text-sm focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">Area (sqft)</label>
            <input name="areaSqft" type="number" required min={1} defaultValue={property.areaSqft} className="w-full border border-border bg-surface px-3 py-3 text-sm focus:border-accent focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-muted">Amenities (comma-separated)</label>
          <input name="amenities" defaultValue={property.amenities.join(", ")} className="w-full border border-border bg-surface px-4 py-3 text-sm focus:border-accent focus:outline-none" />
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground/80">
          <input type="checkbox" name="isFeatured" defaultChecked={property.isFeatured} className="h-4 w-4 accent-accent" />
          Feature this listing on the homepage
        </label>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 bg-accent px-8 py-3 text-sm uppercase tracking-wide text-accent-foreground transition-colors hover:bg-accent-dark disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center justify-center gap-2 border border-red-200 px-6 py-3 text-sm uppercase tracking-wide text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
          >
            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            {isDeleting ? "Deleting..." : "Delete Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
