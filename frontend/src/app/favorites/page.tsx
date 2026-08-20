"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Heart } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getMyFavorites } from "@/lib/api";
import type { PropertyDto } from "@/lib/types";
import PropertyCard from "@/components/property/PropertyCard";

export default function FavoritesPage() {
  const { user, accessToken, isLoading: authLoading } = useAuth();
  const [properties, setProperties] = useState<PropertyDto[] | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getMyFavorites(accessToken)
      .then(setProperties)
      .catch(() => setProperties([]));
  }, [accessToken]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <p className="text-xs uppercase tracking-[0.3em] text-accent">Your Collection</p>
      <h1 className="font-display mt-3 text-4xl text-foreground sm:text-5xl">
        Saved Properties
      </h1>

      {authLoading ? (
        <div className="mt-16 flex justify-center">
          <Loader2 className="animate-spin text-muted" size={24} />
        </div>
      ) : !user ? (
        <div className="mt-14 border border-dashed border-border p-16 text-center">
          <p className="text-sm text-muted">
            <Link href="/login" className="text-accent underline-offset-4 hover:underline">
              Sign in
            </Link>{" "}
            to view the properties you&apos;ve saved.
          </p>
        </div>
      ) : properties === null ? (
        <div className="mt-16 flex justify-center">
          <Loader2 className="animate-spin text-muted" size={24} />
        </div>
      ) : properties.length === 0 ? (
        <div className="mt-14 border border-dashed border-border p-16 text-center">
          <Heart className="mx-auto text-muted" size={24} />
          <p className="mt-4 text-sm text-muted">
            You haven&apos;t saved any properties yet. Tap the heart on any listing to save it here.
          </p>
          <Link
            href="/properties"
            className="mt-6 inline-flex items-center border border-accent px-6 py-2.5 text-sm uppercase tracking-wide text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
