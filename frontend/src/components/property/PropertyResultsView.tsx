"use client";

import { useState } from "react";
import { LayoutGrid, Map as MapIcon } from "lucide-react";
import type { PropertyDto } from "@/lib/types";
import PropertyCard from "@/components/property/PropertyCard";
import PropertiesMap from "@/components/map/PropertiesMap";

/**
 * List/Map toggle for the properties search page. Data fetching stays server-side
 * (see PropertiesPage) — this just switches how the already-fetched result set is
 * displayed, so the initial page load and SEO-relevant HTML are unaffected.
 */
export default function PropertyResultsView({ properties }: { properties: PropertyDto[] }) {
  const [view, setView] = useState<"list" | "map">("list");
  const mappableCount = properties.filter((p) => p.latitude != null && p.longitude != null).length;

  return (
    <div>
      <div className="flex items-center justify-end gap-1 border border-border p-1">
        <button
          type="button"
          onClick={() => setView("list")}
          aria-pressed={view === "list"}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wide transition-colors ${
            view === "list" ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
          }`}
        >
          <LayoutGrid size={14} /> List
        </button>
        <button
          type="button"
          onClick={() => setView("map")}
          aria-pressed={view === "map"}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wide transition-colors ${
            view === "map" ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
          }`}
        >
          <MapIcon size={14} /> Map
        </button>
      </div>

      <div className="mt-6">
        {view === "list" ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : mappableCount === 0 ? (
          <div className="border border-dashed border-border p-16 text-center">
            <p className="text-sm text-muted">None of these listings have a location set yet.</p>
          </div>
        ) : (
          <>
            <PropertiesMap properties={properties} />
            {mappableCount < properties.length && (
              <p className="mt-3 text-xs text-muted">
                Showing {mappableCount} of {properties.length} results with a location set.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
