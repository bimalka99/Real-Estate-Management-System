import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, Ruler, MapPin } from "lucide-react";
import type { PropertyDto } from "@/lib/types";
import { formatPrice, propertyStatusLabels } from "@/lib/format";
import FavoriteButton from "@/components/property/FavoriteButton";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80&auto=format&fit=crop";

export default function PropertyCard({ property }: { property: PropertyDto }) {
  const cover =
    property.images.find((img) => img.isCover)?.url ??
    property.images[0]?.url ??
    FALLBACK_IMAGE;

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group block overflow-hidden border border-border bg-surface transition-shadow hover:shadow-xl hover:shadow-black/5"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={cover}
          alt={property.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 flex flex-col items-start gap-1.5">
          <div className="bg-background/90 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-foreground backdrop-blur-sm">
            {propertyStatusLabels[property.status] ?? property.status}
          </div>
          {property.isFeatured && (
            <div className="bg-accent px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-accent-foreground">
              Featured
            </div>
          )}
        </div>

        <FavoriteButton propertyId={property.id} />
      </div>

      <div className="p-6">
        <p className="font-display text-xl text-foreground">
          {formatPrice(property.price, property.currency)}
          {property.listingType === "Rent" && (
            <span className="ml-1 text-sm font-sans text-muted">/mo</span>
          )}
        </p>

        <h3 className="mt-2 line-clamp-1 text-base text-foreground">{property.title}</h3>

        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
          <MapPin size={14} />
          {property.city}
          {property.state ? `, ${property.state}` : ""}
        </p>

        <div className="mt-5 flex items-center gap-5 border-t border-border pt-4 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <BedDouble size={16} /> {property.bedrooms}
          </span>
          <span className="flex items-center gap-1.5">
            <Bath size={16} /> {property.bathrooms}
          </span>
          <span className="flex items-center gap-1.5">
            <Ruler size={16} /> {Math.round(property.areaSqft).toLocaleString()} sqft
          </span>
        </div>
      </div>
    </Link>
  );
}
