import type { Metadata } from "next";
import { getProperties } from "@/lib/api";
import type { ListingType, PropertyType } from "@/lib/types";
import PropertyResultsView from "@/components/property/PropertyResultsView";
import PropertyFilters from "@/components/property/PropertyFilters";
import Pagination from "@/components/property/Pagination";

export const metadata: Metadata = {
  title: "Properties | Aurelia Estates",
  description: "Browse our curated portfolio of luxury properties.",
};

export default async function PropertiesPage(props: PageProps<"/properties">) {
  const sp = await props.searchParams;

  const city = typeof sp.city === "string" ? sp.city : undefined;
  const type = typeof sp.type === "string" ? (sp.type as PropertyType) : undefined;
  const listingType =
    typeof sp.listingType === "string" ? (sp.listingType as ListingType) : undefined;
  const minPrice = typeof sp.minPrice === "string" ? Number(sp.minPrice) : undefined;
  const maxPrice = typeof sp.maxPrice === "string" ? Number(sp.maxPrice) : undefined;
  const minBedrooms =
    typeof sp.minBedrooms === "string" ? Number(sp.minBedrooms) : undefined;
  const pageNumber = typeof sp.pageNumber === "string" ? Number(sp.pageNumber) : 1;

  let result;
  let loadError = false;
  try {
    result = await getProperties({
      city,
      type,
      listingType,
      minPrice,
      maxPrice,
      minBedrooms,
      pageNumber,
      pageSize: 9,
    });
  } catch {
    loadError = true;
    result = { items: [], pageNumber: 1, totalPages: 0, totalCount: 0, hasPreviousPage: false, hasNextPage: false };
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <p className="text-xs uppercase tracking-[0.3em] text-accent">Portfolio</p>
      <h1 className="font-display mt-3 text-4xl text-foreground sm:text-5xl">
        Properties
      </h1>
      <p className="mt-3 text-sm text-muted">
        {result.totalCount} {result.totalCount === 1 ? "property" : "properties"} found
      </p>

      <div className="mt-10">
        <PropertyFilters
          city={city}
          type={type}
          listingType={listingType}
          minPrice={minPrice ? String(minPrice) : undefined}
          minBedrooms={minBedrooms ? String(minBedrooms) : undefined}
        />
      </div>

      {loadError ? (
        <div className="mt-14 border border-dashed border-border p-16 text-center">
          <p className="text-sm text-muted">
            We couldn&apos;t reach the property service. Please try again shortly.
          </p>
        </div>
      ) : result.items.length === 0 ? (
        <div className="mt-14 border border-dashed border-border p-16 text-center">
          <p className="text-sm text-muted">
            No properties match your search. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <div className="mt-14">
          <PropertyResultsView properties={result.items} />
        </div>
      )}

      <Pagination
        pageNumber={result.pageNumber}
        totalPages={result.totalPages}
        hasPreviousPage={result.hasPreviousPage}
        hasNextPage={result.hasNextPage}
        searchParams={{ city, type, listingType, minPrice: minPrice ? String(minPrice) : undefined, minBedrooms: minBedrooms ? String(minBedrooms) : undefined }}
      />
    </div>
  );
}
