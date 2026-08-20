import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BedDouble,
  Bath,
  Ruler,
  MapPin,
  Calendar,
  Check,
  Video,
} from "lucide-react";
import { getPropertyById } from "@/lib/api";
import { formatPrice, propertyStatusLabels } from "@/lib/format";
import InquiryForm from "@/components/property/InquiryForm";
import FavoriteButton from "@/components/property/FavoriteButton";
import PropertyMap from "@/components/map/PropertyMap";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80&auto=format&fit=crop";

export async function generateMetadata(
  props: PageProps<"/properties/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const property = await getPropertyById(id);

  return {
    title: property ? `${property.title} | Aurelia Estates` : "Property | Aurelia Estates",
    description: property?.description.slice(0, 160),
  };
}

export default async function PropertyDetailPage(props: PageProps<"/properties/[id]">) {
  const { id } = await props.params;
  const property = await getPropertyById(id);

  if (!property) {
    notFound();
  }

  const images = property.images.length > 0 ? property.images : [{ id: "fallback", url: FALLBACK_IMAGE, isCover: true, sortOrder: 0 }];
  const cover = images.find((img) => img.isCover) ?? images[0];
  const rest = images.filter((img) => img.id !== cover.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
      {/* Gallery */}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-4 lg:grid-rows-2">
        <div className="relative aspect-[4/3] overflow-hidden lg:col-span-2 lg:row-span-2 lg:aspect-auto">
          <Image src={cover.url} alt={property.title} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" priority />
        </div>
        {rest.map((img) => (
          <div key={img.id} className="relative hidden aspect-[4/3] overflow-hidden lg:block">
            <Image src={img.url} alt={property.title} fill sizes="25vw" className="object-cover" />
          </div>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="bg-surface-muted px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-foreground">
              {propertyStatusLabels[property.status] ?? property.status}
            </span>
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">
              {property.type}
            </span>
          </div>

          <h1 className="font-display mt-4 text-3xl text-foreground sm:text-4xl">
            {property.title}
          </h1>

          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
            <MapPin size={15} />
            {property.addressLine}, {property.city}
            {property.state ? `, ${property.state}` : ""}, {property.country}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-6 border-y border-border py-6 sm:grid-cols-4">
            <div>
              <BedDouble size={18} className="text-accent" />
              <p className="mt-2 text-sm text-foreground">{property.bedrooms} Beds</p>
            </div>
            <div>
              <Bath size={18} className="text-accent" />
              <p className="mt-2 text-sm text-foreground">{property.bathrooms} Baths</p>
            </div>
            <div>
              <Ruler size={18} className="text-accent" />
              <p className="mt-2 text-sm text-foreground">
                {Math.round(property.areaSqft).toLocaleString()} sqft
              </p>
            </div>
            {property.yearBuilt && (
              <div>
                <Calendar size={18} className="text-accent" />
                <p className="mt-2 text-sm text-foreground">Built {property.yearBuilt}</p>
              </div>
            )}
          </div>

          <div className="mt-10">
            <h2 className="font-display text-2xl text-foreground">About this property</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted">
              {property.description}
            </p>
          </div>

          {property.amenities.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-2xl text-foreground">Amenities</h2>
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {property.amenities.map((amenity) => (
                  <li key={amenity} className="flex items-center gap-2 text-sm text-foreground/80">
                    <Check size={14} className="text-accent" />
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {property.latitude != null && property.longitude != null && (
            <div className="mt-10">
              <h2 className="font-display text-2xl text-foreground">Location</h2>
              <div className="mt-4">
                <PropertyMap
                  latitude={property.latitude}
                  longitude={property.longitude}
                  title={property.title}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-28 border border-border bg-surface p-6">
            <p className="font-display text-3xl text-foreground">
              {formatPrice(property.price, property.currency)}
              {property.listingType === "Rent" && (
                <span className="ml-1 text-sm font-sans text-muted">/mo</span>
              )}
            </p>

            <div className="mt-4">
              <FavoriteButton propertyId={property.id} variant="detail" />
            </div>

            <div className="mt-6 border-t border-border pt-6">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Listed by</p>
              <Link
                href={`/agents/${property.agentId}`}
                className="mt-2 block font-display text-lg text-foreground hover:text-accent"
              >
                {property.agentName}
              </Link>
              {property.agencyName && (
                <p className="text-sm text-muted">{property.agencyName}</p>
              )}
            </div>

            <InquiryForm propertyId={property.id} />

            {property.virtualTourUrl && (
              <a
                href={property.virtualTourUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center justify-center gap-2 text-sm text-muted underline-offset-4 hover:text-accent hover:underline"
              >
                <Video size={14} /> View virtual tour
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
