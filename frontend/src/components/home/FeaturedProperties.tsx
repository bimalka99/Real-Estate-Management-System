import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFeaturedProperties } from "@/lib/api";
import PropertyCard from "@/components/property/PropertyCard";
import type { PropertyDto } from "@/lib/types";

export default async function FeaturedProperties() {
  let properties: PropertyDto[] = [];
  try {
    properties = await getFeaturedProperties(6);
  } catch {
    // Backend not reachable — render the section gracefully instead of crashing the page.
    properties = [];
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Featured</p>
          <h2 className="font-display mt-3 text-4xl text-foreground">
            A Selection of Distinguished Homes
          </h2>
        </div>
        <Link
          href="/properties"
          className="flex items-center gap-2 text-sm tracking-wide text-foreground/80 hover:text-accent"
        >
          View all properties <ArrowRight size={16} />
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="mt-14 border border-dashed border-border p-16 text-center">
          <p className="text-sm text-muted">
            No featured listings yet &mdash; new properties will appear here as
            they&apos;re added.
          </p>
        </div>
      ) : (
        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </section>
  );
}
