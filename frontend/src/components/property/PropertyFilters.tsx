import { SlidersHorizontal } from "lucide-react";

interface Props {
  city?: string;
  type?: string;
  listingType?: string;
  minPrice?: string;
  maxPrice?: string;
  minBedrooms?: string;
}

export default function PropertyFilters(props: Props) {
  return (
    <form
      action="/properties"
      method="GET"
      className="border border-border bg-surface p-6"
    >
      <div className="mb-5 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-muted">
        <SlidersHorizontal size={16} />
        Refine Search
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <label className="mb-1.5 block text-xs text-muted">City</label>
          <input
            type="text"
            name="city"
            defaultValue={props.city}
            placeholder="e.g. Malibu"
            className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-muted">Type</label>
          <select
            name="type"
            defaultValue={props.type ?? ""}
            className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
          >
            <option value="">Any</option>
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
          <label className="mb-1.5 block text-xs text-muted">Buy / Rent</label>
          <select
            name="listingType"
            defaultValue={props.listingType ?? ""}
            className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
          >
            <option value="">Any</option>
            <option value="Sale">For Sale</option>
            <option value="Rent">For Rent</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-muted">Min Price</label>
          <input
            type="number"
            name="minPrice"
            defaultValue={props.minPrice}
            placeholder="$0"
            className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-muted">Bedrooms</label>
          <select
            name="minBedrooms"
            defaultValue={props.minBedrooms ?? ""}
            className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          className="bg-accent px-8 py-2.5 text-sm uppercase tracking-wide text-accent-foreground transition-colors hover:bg-accent-dark"
        >
          Apply Filters
        </button>
      </div>
    </form>
  );
}
